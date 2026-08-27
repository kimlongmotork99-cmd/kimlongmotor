-- ============================================================================
-- Search migration: full-text search có dấu/không dấu cho products + news
-- Chạy file này trong Supabase SQL editor (sau schema.sql).
-- An toàn để chạy lại nhiều lần (idempotent).
-- ============================================================================

-- 0) Supabase mặc định cài extension vào schema "extensions", không phải "public".
--    Set search_path cho session này để các lệnh CREATE FUNCTION / CREATE INDEX bên dưới
--    luôn tìm thấy unaccent()/pg_trgm dù nó nằm ở schema nào.
set search_path = public, extensions;

-- 1) Bật extension unaccent để bỏ dấu tiếng Việt khi so khớp
create extension if not exists unaccent;

-- 2) unaccent() mặc định không IMMUTABLE nên không dùng được trong cột generated /
--    index trực tiếp. Bọc lại một hàm IMMUTABLE riêng.
create or replace function public.f_unaccent(text)
returns text
language sql
immutable
parallel safe
set search_path = public, extensions
as $$
  select unaccent($1)
$$;

-- 3) Thêm cột tsvector sinh tự động (generated) từ các trường liên quan, đã bỏ dấu.
--    Trọng số: A = tên/tiêu đề (quan trọng nhất), B = mô tả ngắn, C = mô tả dài/nội dung.
alter table public.products
  add column if not exists search_vector tsvector
  generated always as (
    setweight(to_tsvector('simple', public.f_unaccent(coalesce(name, ''))), 'A') ||
    setweight(to_tsvector('simple', public.f_unaccent(coalesce(category, ''))), 'B') ||
    setweight(to_tsvector('simple', public.f_unaccent(coalesce(tagline, ''))), 'B') ||
    setweight(to_tsvector('simple', public.f_unaccent(coalesce(description, ''))), 'C')
  ) stored;

alter table public.news
  add column if not exists search_vector tsvector
  generated always as (
    setweight(to_tsvector('simple', public.f_unaccent(coalesce(title, ''))), 'A') ||
    setweight(to_tsvector('simple', public.f_unaccent(coalesce(category, ''))), 'B') ||
    setweight(to_tsvector('simple', public.f_unaccent(coalesce(excerpt, ''))), 'B') ||
    setweight(to_tsvector('simple', public.f_unaccent(coalesce(content, ''))), 'C')
  ) stored;

-- 4) Index GIN để tra cứu nhanh trên cột tsvector
create index if not exists products_search_idx on public.products using gin(search_vector);
create index if not exists news_search_idx on public.news using gin(search_vector);

-- 5) Hàm RPC gộp kết quả từ nhiều bảng, xếp hạng theo mức khớp (ts_rank),
--    chỉ trả về nội dung đã published. Gọi từ app qua supabase.rpc('search_site', {...}).
create or replace function public.search_site(q text, max_results int default 20)
returns table (
  type text,
  id uuid,
  slug text,
  title text,
  subtitle text,
  image text,
  category text,
  rank real
)
language sql
stable
security definer
set search_path = public
as $$
  with query as (
    select websearch_to_tsquery('simple', public.f_unaccent(coalesce(q, ''))) as tsq
  )
  select * from (
    select
      'product'::text as type,
      p.id,
      p.slug,
      p.name as title,
      p.tagline as subtitle,
      p.hero_image as image,
      p.category,
      ts_rank(p.search_vector, query.tsq) as rank
    from public.products p, query
    where p.status = 'published' and p.search_vector @@ query.tsq

    union all

    select
      'news'::text as type,
      n.id,
      n.slug,
      n.title,
      n.excerpt as subtitle,
      n.cover_image as image,
      n.category,
      ts_rank(n.search_vector, query.tsq) as rank
    from public.news n, query
    where n.status = 'published' and n.search_vector @@ query.tsq
  ) combined
  order by rank desc, title asc
  limit greatest(1, least(max_results, 50))
$$;

-- Cho phép gọi RPC ẩn danh (trang tìm kiếm public, không cần đăng nhập)
grant execute on function public.search_site(text, int) to anon, authenticated;
