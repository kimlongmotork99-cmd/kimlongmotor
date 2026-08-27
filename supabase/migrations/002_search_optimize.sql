-- ============================================================================
-- Search optimize migration (V3.4): nâng cấp full-text search
-- Chạy sau 001_search.sql. An toàn để chạy lại nhiều lần (idempotent).
--
-- Thêm:
-- 1) Prefix / typeahead search — gõ "xe kh" vẫn ra "xe khách" (chưa gõ xong từ).
-- 2) pg_trgm — chịu lỗi gõ sai/thiếu dấu, làm fallback khi full-text không khớp.
-- 3) Highlight (ts_headline) — trả về đoạn trích có bôi đậm từ khóa khớp.
-- 4) search_suggest() — RPC gợi ý nhanh (autocomplete) khi người dùng đang gõ.
-- ============================================================================

-- 0) Đảm bảo tìm thấy extension dù Supabase cài vào schema "extensions" hay "public".
set search_path = public, extensions;

-- 1) Bật extension trigram để so khớp gần đúng / chịu lỗi chính tả
create extension if not exists pg_trgm;

-- 2) Index trigram trên bản đã bỏ dấu để tra fuzzy nhanh
create index if not exists products_name_trgm_idx on public.products using gin (public.f_unaccent(name) gin_trgm_ops);
create index if not exists news_title_trgm_idx on public.news using gin (public.f_unaccent(title) gin_trgm_ops);

-- 3) Hàm dựng tsquery hỗ trợ prefix: từ cuối cùng người dùng đang gõ dở
--    sẽ được match dạng "tu:*" thay vì phải gõ đủ từ mới ra kết quả.
create or replace function public.f_prefix_tsquery(q text)
returns tsquery
language plpgsql
immutable
parallel safe
as $$
declare
  terms text[];
  n int;
begin
  terms := array_remove(regexp_split_to_array(trim(public.f_unaccent(coalesce(q, ''))), '\s+'), '');
  n := coalesce(array_length(terms, 1), 0);
  if n = 0 then
    return to_tsquery('simple', '');
  end if;

  -- Từ cuối cùng đang gõ dở -> match dạng prefix (vd "kh" khớp "khách")
  terms[n] := terms[n] || ':*';

  begin
    return to_tsquery('simple', array_to_string(terms, ' & '));
  exception when others then
    -- Ký tự đặc biệt phá cú pháp tsquery -> coi như không có điều kiện prefix
    return to_tsquery('simple', '');
  end;
end;
$$;

-- 4) search_site: thêm prefix search + fallback trigram (chịu lỗi gõ sai) + snippet highlight
--    Phải DROP trước vì bản mới có thêm cột "snippet" (đổi kiểu trả về, CREATE OR REPLACE không cho phép).
drop function if exists public.search_site(text, int);
create or replace function public.search_site(q text, max_results int default 20)
returns table (
  type text,
  id uuid,
  slug text,
  title text,
  subtitle text,
  image text,
  category text,
  rank real,
  snippet text
)
language sql
stable
security definer
set search_path = public
as $$
  with query as (
    select
      websearch_to_tsquery('simple', public.f_unaccent(coalesce(q, ''))) as tsq_exact,
      public.f_prefix_tsquery(q) as tsq_prefix,
      public.f_unaccent(coalesce(q, '')) as nq
  ),
  fulltext as (
    select
      'product'::text as type, p.id, p.slug, p.name as title, p.tagline as subtitle,
      p.hero_image as image, p.category,
      ts_rank(p.search_vector, query.tsq_exact) + 0.5 * ts_rank(p.search_vector, query.tsq_prefix) as rank,
      ts_headline('simple', coalesce(p.description, p.tagline, ''), query.tsq_exact,
        'StartSel=@@HL@@, StopSel=@@ENDHL@@, MaxWords=28, MinWords=12, MaxFragments=1') as snippet
    from public.products p, query
    where p.status = 'published'
      and (p.search_vector @@ query.tsq_exact or p.search_vector @@ query.tsq_prefix)

    union all

    select
      'news'::text as type, n.id, n.slug, n.title, n.excerpt as subtitle,
      n.cover_image as image, n.category,
      ts_rank(n.search_vector, query.tsq_exact) + 0.5 * ts_rank(n.search_vector, query.tsq_prefix) as rank,
      ts_headline('simple', coalesce(n.content, n.excerpt, ''), query.tsq_exact,
        'StartSel=@@HL@@, StopSel=@@ENDHL@@, MaxWords=28, MinWords=12, MaxFragments=1') as snippet
    from public.news n, query
    where n.status = 'published'
      and (n.search_vector @@ query.tsq_exact or n.search_vector @@ query.tsq_prefix)
  ),
  -- Fallback mờ (trigram): chỉ chạy khi full-text không ra đủ kết quả, giúp chịu lỗi gõ sai/thiếu dấu.
  fuzzy as (
    select
      'product'::text as type, p.id, p.slug, p.name as title, p.tagline as subtitle,
      p.hero_image as image, p.category,
      similarity(public.f_unaccent(p.name), query.nq) as rank,
      coalesce(p.tagline, '') as snippet
    from public.products p, query
    where p.status = 'published'
      and public.f_unaccent(p.name) % query.nq
      and (select count(*) from fulltext) < max_results

    union all

    select
      'news'::text as type, n.id, n.slug, n.title, n.excerpt as subtitle,
      n.cover_image as image, n.category,
      similarity(public.f_unaccent(n.title), query.nq) as rank,
      coalesce(n.excerpt, '') as snippet
    from public.news n, query
    where n.status = 'published'
      and public.f_unaccent(n.title) % query.nq
      and (select count(*) from fulltext) < max_results
  )
  select * from (
    select * from fulltext
    union all
    select f.* from fuzzy f
    where not exists (select 1 from fulltext ft where ft.type = f.type and ft.id = f.id)
  ) combined
  order by rank desc, title asc
  limit greatest(1, least(max_results, 50))
$$;

grant execute on function public.search_site(text, int) to anon, authenticated;

-- 5) search_suggest: gợi ý nhanh (autocomplete) trong lúc gõ — chỉ trả tiêu đề + đường dẫn,
--    dùng prefix + trigram nên chịu được gõ dở/gõ sai, nhẹ hơn search_site cho mỗi phím gõ.
create or replace function public.search_suggest(q text, max_results int default 6)
returns table (
  type text,
  slug text,
  title text,
  category text
)
language sql
stable
security definer
set search_path = public
as $$
  with query as (
    select public.f_prefix_tsquery(q) as tsq_prefix, public.f_unaccent(coalesce(q, '')) as nq
  )
  select type, slug, title, category from (
    select 'product'::text as type, p.slug, p.name as title, p.category,
      ts_rank(p.search_vector, query.tsq_prefix) as rank
    from public.products p, query
    where p.status = 'published' and p.search_vector @@ query.tsq_prefix

    union all

    select 'news'::text as type, n.slug, n.title, n.category,
      ts_rank(n.search_vector, query.tsq_prefix) as rank
    from public.news n, query
    where n.status = 'published' and n.search_vector @@ query.tsq_prefix
  ) combined
  order by rank desc, title asc
  limit greatest(1, least(max_results, 10))
$$;

grant execute on function public.search_suggest(text, int) to anon, authenticated;
