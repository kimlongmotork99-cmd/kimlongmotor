create extension if not exists pgcrypto;

create table if not exists public.products (
 id uuid primary key default gen_random_uuid(), slug text unique not null, name text not null, category text not null default 'BUS', tagline text, description text,
 price numeric, price_label text, featured boolean not null default false, status text not null default 'draft' check(status in ('draft','published')),
 hero_image text, gallery jsonb not null default '[]'::jsonb, specs jsonb not null default '[]'::jsonb, catalogue_url text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.news (
 id uuid primary key default gen_random_uuid(), slug text unique not null, title text not null, excerpt text, content text not null default '', cover_image text,
 category text default 'Tin tức', published_at timestamptz, status text not null default 'draft' check(status in ('draft','published')), featured boolean not null default false, created_at timestamptz not null default now()
);
create table if not exists public.media (
 id uuid primary key default gen_random_uuid(), name text not null, url text not null, type text not null default 'image', alt text, size_bytes bigint, created_at timestamptz not null default now()
);
create table if not exists public.inquiries (
 id uuid primary key default gen_random_uuid(), name text not null, phone text not null, email text, vehicle text, message text, status text not null default 'new' check(status in ('new','contacted','closed')), created_at timestamptz not null default now()
);
create table if not exists public.site_settings (
 key text primary key, value jsonb not null default '{}'::jsonb, updated_at timestamptz not null default now()
);
create table if not exists public.user_profiles (
 id uuid primary key references auth.users(id) on delete cascade, full_name text, role text not null default 'editor' check(role in ('admin','editor','sales')), avatar_url text, active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

alter table public.products enable row level security; alter table public.news enable row level security; alter table public.media enable row level security; alter table public.inquiries enable row level security; alter table public.site_settings enable row level security; alter table public.user_profiles enable row level security;

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.user_profiles where id=auth.uid() and role='admin' and active=true) $$;
create or replace function public.is_staff() returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.user_profiles where id=auth.uid() and active=true) $$;

-- Public reads
 drop policy if exists "public products" on public.products; create policy "public products" on public.products for select using (status='published' or public.is_staff());
 drop policy if exists "public news" on public.news; create policy "public news" on public.news for select using (status='published' or public.is_staff());
 drop policy if exists "public media" on public.media; create policy "public media" on public.media for select using (true);
 drop policy if exists "public inquiry insert" on public.inquiries; create policy "public inquiry insert" on public.inquiries for insert to anon, authenticated with check (true);
 drop policy if exists "public settings" on public.site_settings; create policy "public settings" on public.site_settings for select using (true);

-- Staff write policies
 drop policy if exists "staff products insert" on public.products; create policy "staff products insert" on public.products for insert to authenticated with check (public.is_staff());
 drop policy if exists "staff products update" on public.products; create policy "staff products update" on public.products for update to authenticated using (public.is_staff()) with check (public.is_staff());
 drop policy if exists "admin products delete" on public.products; create policy "admin products delete" on public.products for delete to authenticated using (public.is_admin());
 drop policy if exists "staff news insert" on public.news; create policy "staff news insert" on public.news for insert to authenticated with check (public.is_staff());
 drop policy if exists "staff news update" on public.news; create policy "staff news update" on public.news for update to authenticated using (public.is_staff()) with check (public.is_staff());
 drop policy if exists "admin news delete" on public.news; create policy "admin news delete" on public.news for delete to authenticated using (public.is_admin());
 drop policy if exists "staff media insert" on public.media; create policy "staff media insert" on public.media for insert to authenticated with check (public.is_staff());
 drop policy if exists "admin media delete" on public.media; create policy "admin media delete" on public.media for delete to authenticated using (public.is_admin());
 drop policy if exists "staff inquiry read" on public.inquiries; create policy "staff inquiry read" on public.inquiries for select to authenticated using (public.is_staff());
 drop policy if exists "staff inquiry update" on public.inquiries; create policy "staff inquiry update" on public.inquiries for update to authenticated using (public.is_staff()) with check (public.is_staff());
 drop policy if exists "admin settings" on public.site_settings; create policy "admin settings" on public.site_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());
 drop policy if exists "own profile read" on public.user_profiles; create policy "own profile read" on public.user_profiles for select to authenticated using (id=auth.uid() or public.is_admin());
 drop policy if exists "admin profile all" on public.user_profiles; create policy "admin profile all" on public.user_profiles for all to authenticated using (public.is_admin()) with check (public.is_admin());

insert into public.site_settings(key,value) values
('brand','{"name":"KIM LONG MOTOR","logo":"","favicon":""}'),
('contact','{"hotline":"1900 9898 69","email":"info@kimlongmotor.vn","address":"Khu phức hợp sản xuất ô tô Kim Long Motor Huế"}'),
('seo','{"title":"KIM LONG MOTOR | Ô tô thương mại Việt Nam","description":"KIM LONG MOTOR – giải pháp vận tải toàn diện.","keywords":"Kim Long Motor, KIMLONG 99, KIMMAI9, xe bus, minibus"}'),
('homepage','{"heroTitle":"KIM LONG MOTOR","heroSubtitle":"ENGINEERED TO MOVE","heroImage":"/assets/hero.jpg","heroCta":"KHÁM PHÁ SẢN PHẨM"}'),
('menu','{"items":[{"label":"Sản phẩm","href":"/products"},{"label":"Công nghệ","href":"/technology"},{"label":"Giải pháp","href":"/solutions"},{"label":"Dịch vụ","href":"/service"},{"label":"Về Kim Long","href":"/about"},{"label":"Media","href":"/media"},{"label":"Liên hệ","href":"/contact"}]}')
on conflict(key) do nothing;

insert into public.products(slug,name,category,tagline,description,featured,status,hero_image,specs) values
('kimlong-99','KIMLONG 99','BUS','Đẳng cấp – An toàn – Hiệu quả','Dòng xe bus thế hệ mới, tối ưu vận hành và trải nghiệm hành khách.',true,'published','/assets/bus.jpg','[{"label":"Động cơ","value":"YUCHAI/WEICHAI"},{"label":"Hộp số","value":"FAST 6 cấp"},{"label":"Chiều dài","value":"12 m"},{"label":"Tiêu chuẩn","value":"Euro 5"}]') on conflict(slug) do nothing;
insert into public.products(slug,name,category,tagline,description,featured,status,hero_image,specs) values
('kimmai9','KIMMAI9','MINIBUS','16 chỗ – Tiện nghi – Linh hoạt','Minibus 16 chỗ cho đô thị, du lịch và đưa đón.',true,'published','/assets/city.jpg','[{"label":"Số chỗ","value":"16"},{"label":"Mục đích","value":"Du lịch / đưa đón"},{"label":"Thiết kế","value":"Hiện đại"}]') on conflict(slug) do nothing;
insert into public.news(slug,title,excerpt,content,cover_image,category,published_at,status,featured) values
('kim-long-motor-ban-giao-100-xe','KIM LONG MOTOR bàn giao 100 xe buýt','Hoạt động bàn giao xe và mở rộng giải pháp vận tải công cộng.','KIM LONG MOTOR tiếp tục mở rộng hệ sinh thái vận tải và đồng hành cùng các doanh nghiệp vận tải.','/assets/news.jpg','Sự kiện',now(),'published',true) on conflict(slug) do nothing;
insert into storage.buckets (id,name,public) values ('media','media',true) on conflict(id) do nothing;
drop policy if exists "media public read" on storage.objects; create policy "media public read" on storage.objects for select using (bucket_id='media');
drop policy if exists "media staff upload" on storage.objects; create policy "media staff upload" on storage.objects for insert to authenticated with check (bucket_id='media' and public.is_staff());
drop policy if exists "media admin delete" on storage.objects; create policy "media admin delete" on storage.objects for delete to authenticated using (bucket_id='media' and public.is_admin());

-- Automatically create a CMS profile for every newly-created Auth user.
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin insert into public.user_profiles(id,full_name,role) values(new.id,coalesce(new.raw_user_meta_data->>'full_name',''),coalesce(new.raw_user_meta_data->>'role','editor')) on conflict(id) do nothing; return new; end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

-- After creating your first Auth account, promote it once in SQL:
-- update public.user_profiles set role='admin' where id=(select id from auth.users where email='YOUR_EMAIL');

-- ============================================================
-- KIM LONG MOTOR V3.2 - ERP MINI / SALES / CONTENT BUILDER
-- ============================================================
create table if not exists public.dealers (
 id uuid primary key default gen_random_uuid(),
 name text not null,
 code text unique,
 region text,
 address text,
 phone text,
 email text,
 manager text,
 status text not null default 'active' check(status in ('active','inactive')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table if not exists public.service_centers (
 id uuid primary key default gen_random_uuid(),
 name text not null,
 code text unique,
 region text,
 address text,
 phone text,
 email text,
 services jsonb not null default '[]'::jsonb,
 latitude numeric,
 longitude numeric,
 status text not null default 'active' check(status in ('active','inactive')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table if not exists public.catalogue_versions (
 id uuid primary key default gen_random_uuid(),
 product_id uuid references public.products(id) on delete cascade,
 version text not null,
 title text,
 file_url text not null,
 file_size bigint,
 is_current boolean not null default false,
 published_at timestamptz,
 created_at timestamptz not null default now(),
 unique(product_id, version)
);

create table if not exists public.home_banners (
 id uuid primary key default gen_random_uuid(),
 title text not null,
 subtitle text,
 image_url text not null,
 mobile_image_url text,
 cta_label text,
 cta_url text,
 sort_order integer not null default 0,
 status text not null default 'draft' check(status in ('draft','published')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table if not exists public.content_pages (
 id uuid primary key default gen_random_uuid(),
 slug text unique not null,
 title text not null,
 excerpt text,
 status text not null default 'draft' check(status in ('draft','published')),
 seo jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table if not exists public.content_blocks (
 id uuid primary key default gen_random_uuid(),
 page_id uuid not null references public.content_pages(id) on delete cascade,
 type text not null check(type in ('hero','text','image','gallery','stats','cta','products','news')),
 sort_order integer not null default 0,
 data jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

-- Extend inquiries into a lightweight sales pipeline.
alter table public.inquiries add column if not exists lead_source text default 'Website';
alter table public.inquiries add column if not exists assigned_to uuid references auth.users(id) on delete set null;
alter table public.inquiries add column if not exists dealer_id uuid references public.dealers(id) on delete set null;
alter table public.inquiries add column if not exists deal_value numeric default 0;
alter table public.inquiries add column if not exists next_follow_up timestamptz;
alter table public.inquiries add column if not exists notes text;
alter table public.inquiries drop constraint if exists inquiries_status_check;
alter table public.inquiries add constraint inquiries_status_check check(status in ('new','contacted','qualified','proposal','won','lost','closed'));

alter table public.dealers enable row level security;
alter table public.service_centers enable row level security;
alter table public.catalogue_versions enable row level security;
alter table public.home_banners enable row level security;
alter table public.content_pages enable row level security;
alter table public.content_blocks enable row level security;

-- Public website data.
drop policy if exists "public service centers" on public.service_centers;
create policy "public service centers" on public.service_centers for select using (status='active' or public.is_staff());
drop policy if exists "public banners" on public.home_banners;
create policy "public banners" on public.home_banners for select using (status='published' or public.is_staff());
drop policy if exists "public content pages" on public.content_pages;
create policy "public content pages" on public.content_pages for select using (status='published' or public.is_staff());
drop policy if exists "public content blocks" on public.content_blocks;
create policy "public content blocks" on public.content_blocks for select using (exists(select 1 from public.content_pages p where p.id=page_id and (p.status='published' or public.is_staff())));
drop policy if exists "public catalogue versions" on public.catalogue_versions;
create policy "public catalogue versions" on public.catalogue_versions for select using (true);

-- Admin / sales write access.
drop policy if exists "staff service centers insert" on public.service_centers;
create policy "staff service centers insert" on public.service_centers for insert to authenticated with check (public.is_staff());
drop policy if exists "staff service centers update" on public.service_centers;
create policy "staff service centers update" on public.service_centers for update to authenticated using (public.is_staff()) with check (public.is_staff());
drop policy if exists "admin service centers delete" on public.service_centers;
create policy "admin service centers delete" on public.service_centers for delete to authenticated using (public.is_admin());

drop policy if exists "staff dealers read" on public.dealers;
create policy "staff dealers read" on public.dealers for select to authenticated using (public.is_staff());
drop policy if exists "staff dealers insert" on public.dealers;
create policy "staff dealers insert" on public.dealers for insert to authenticated with check (public.is_staff());
drop policy if exists "staff dealers update" on public.dealers;
create policy "staff dealers update" on public.dealers for update to authenticated using (public.is_staff()) with check (public.is_staff());
drop policy if exists "admin dealers delete" on public.dealers;
create policy "admin dealers delete" on public.dealers for delete to authenticated using (public.is_admin());

drop policy if exists "staff catalogue insert" on public.catalogue_versions;
create policy "staff catalogue insert" on public.catalogue_versions for insert to authenticated with check (public.is_staff());
drop policy if exists "staff catalogue update" on public.catalogue_versions;
create policy "staff catalogue update" on public.catalogue_versions for update to authenticated using (public.is_staff()) with check (public.is_staff());
drop policy if exists "admin catalogue delete" on public.catalogue_versions;
create policy "admin catalogue delete" on public.catalogue_versions for delete to authenticated using (public.is_admin());

drop policy if exists "staff banners insert" on public.home_banners;
create policy "staff banners insert" on public.home_banners for insert to authenticated with check (public.is_staff());
drop policy if exists "staff banners update" on public.home_banners;
create policy "staff banners update" on public.home_banners for update to authenticated using (public.is_staff()) with check (public.is_staff());
drop policy if exists "admin banners delete" on public.home_banners;
create policy "admin banners delete" on public.home_banners for delete to authenticated using (public.is_admin());

drop policy if exists "staff pages insert" on public.content_pages;
create policy "staff pages insert" on public.content_pages for insert to authenticated with check (public.is_staff());
drop policy if exists "staff pages update" on public.content_pages;
create policy "staff pages update" on public.content_pages for update to authenticated using (public.is_staff()) with check (public.is_staff());
drop policy if exists "admin pages delete" on public.content_pages;
create policy "admin pages delete" on public.content_pages for delete to authenticated using (public.is_admin());

drop policy if exists "staff blocks insert" on public.content_blocks;
create policy "staff blocks insert" on public.content_blocks for insert to authenticated with check (public.is_staff());
drop policy if exists "staff blocks update" on public.content_blocks;
create policy "staff blocks update" on public.content_blocks for update to authenticated using (public.is_staff()) with check (public.is_staff());
drop policy if exists "admin blocks delete" on public.content_blocks;
create policy "admin blocks delete" on public.content_blocks for delete to authenticated using (public.is_admin());

-- Sales users can manage leads; admins have all access.
drop policy if exists "sales inquiry update" on public.inquiries;
create policy "sales inquiry update" on public.inquiries for update to authenticated using (public.is_admin() or public.is_staff()) with check (public.is_admin() or public.is_staff());

insert into public.site_settings(key,value) values
('erp','{"currency":"VND","targetMonthly":10000000000,"targetYearly":120000000000}'),
('sales','{"pipelineStages":["new","contacted","qualified","proposal","won","lost"]}')
on conflict(key) do nothing;
insert into public.home_banners(title,subtitle,image_url,cta_label,cta_url,sort_order,status)
select 'KIM LONG MOTOR','ENGINEERED TO MOVE','/assets/hero.jpg','KHÁM PHÁ SẢN PHẨM','/products',0,'published'
where not exists (select 1 from public.home_banners);
