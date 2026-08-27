-- ============================================================================
-- Service features migration (V3.4): backend thật cho
--   - Đặt lịch dịch vụ (service_bookings)
--   - Tra cứu bảo hành theo VIN / biển số (vehicle_warranties + RPC check_warranty)
-- "Tìm trạm dịch vụ" dùng luôn bảng service_centers có sẵn (không cần bảng mới).
-- Chạy sau 001_search.sql và 002_search_optimize.sql. An toàn để chạy lại nhiều lần.
-- ============================================================================

-- Chuẩn hoá VIN / biển số để so khớp không phân biệt hoa-thường, dấu cách, dấu gạch ngang.
create or replace function public.f_normalize_code(v text)
returns text
language sql
immutable
parallel safe
as $$
  select upper(regexp_replace(coalesce(v, ''), '[^a-zA-Z0-9]', '', 'g'))
$$;

-- ----------------------------------------------------------------------------
-- 1) ĐẶT LỊCH DỊCH VỤ
-- ----------------------------------------------------------------------------
create table if not exists public.service_bookings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  vehicle text,
  plate text,
  service_center_id uuid references public.service_centers(id) on delete set null,
  preferred_date date,
  preferred_time text,
  note text,
  status text not null default 'new' check (status in ('new', 'confirmed', 'done', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.service_bookings enable row level security;

-- Public: bất kỳ ai cũng đặt lịch được (không cần đăng nhập), giống cơ chế inquiries.
drop policy if exists "public booking insert" on public.service_bookings;
create policy "public booking insert" on public.service_bookings
  for insert to anon, authenticated with check (true);

-- Chỉ nhân viên (đã đăng nhập + active) mới xem/xử lý được lịch đặt.
drop policy if exists "staff booking select" on public.service_bookings;
create policy "staff booking select" on public.service_bookings
  for select using (public.is_staff());

drop policy if exists "staff booking update" on public.service_bookings;
create policy "staff booking update" on public.service_bookings
  for update using (public.is_staff()) with check (public.is_staff());

drop policy if exists "staff booking delete" on public.service_bookings;
create policy "staff booking delete" on public.service_bookings
  for delete using (public.is_staff());

create index if not exists service_bookings_status_idx on public.service_bookings (status, created_at desc);

-- ----------------------------------------------------------------------------
-- 2) TRA CỨU BẢO HÀNH (VIN / biển số)
-- ----------------------------------------------------------------------------
create table if not exists public.vehicle_warranties (
  id uuid primary key default gen_random_uuid(),
  vin text,
  plate text,
  owner_name text,
  phone text,
  product_name text not null,
  dealer text,
  purchase_date date not null,
  warranty_months int not null default 24,
  status text not null default 'active' check (status in ('active', 'expired', 'void')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Cột chuẩn hoá (generated) để tra cứu chính xác, không phân biệt hoa-thường / khoảng trắng.
alter table public.vehicle_warranties
  add column if not exists vin_normalized text generated always as (public.f_normalize_code(vin)) stored;
alter table public.vehicle_warranties
  add column if not exists plate_normalized text generated always as (public.f_normalize_code(plate)) stored;

create unique index if not exists vehicle_warranties_vin_idx
  on public.vehicle_warranties (vin_normalized) where vin_normalized <> '';
create index if not exists vehicle_warranties_plate_idx
  on public.vehicle_warranties (plate_normalized) where plate_normalized <> '';

alter table public.vehicle_warranties enable row level security;

-- Không có policy select công khai: dữ liệu khách hàng (tên, SĐT) không được lộ trực tiếp.
-- Người dùng công khai chỉ tra cứu qua RPC check_warranty() bên dưới (trả về trường giới hạn).
drop policy if exists "staff warranty select" on public.vehicle_warranties;
create policy "staff warranty select" on public.vehicle_warranties
  for select using (public.is_staff());

drop policy if exists "staff warranty insert" on public.vehicle_warranties;
create policy "staff warranty insert" on public.vehicle_warranties
  for insert to authenticated with check (public.is_staff());

drop policy if exists "staff warranty update" on public.vehicle_warranties;
create policy "staff warranty update" on public.vehicle_warranties
  for update using (public.is_staff()) with check (public.is_staff());

drop policy if exists "staff warranty delete" on public.vehicle_warranties;
create policy "staff warranty delete" on public.vehicle_warranties
  for delete using (public.is_staff());

-- RPC công khai: nhập VIN hoặc biển số -> trả về tình trạng bảo hành.
-- security definer để vượt qua RLS ở trên nhưng CHỈ trả các cột được liệt kê (không có tên/SĐT khách).
create or replace function public.check_warranty(code text)
returns table (
  found boolean,
  product_name text,
  purchase_date date,
  warranty_end_date date,
  months_left int,
  status text
)
language sql
stable
security definer
set search_path = public
as $$
  with input as (
    select public.f_normalize_code(code) as nc
  ),
  match as (
    select
      w.product_name,
      w.purchase_date,
      (w.purchase_date + (w.warranty_months::text || ' months')::interval)::date as warranty_end_date,
      w.status
    from public.vehicle_warranties w, input
    where input.nc <> ''
      and (w.vin_normalized = input.nc or w.plate_normalized = input.nc)
    order by w.purchase_date desc
    limit 1
  )
  select
    (select count(*) from match) > 0 as found,
    m.product_name,
    m.purchase_date,
    m.warranty_end_date,
    greatest(0, (m.warranty_end_date - current_date) / 30)::int as months_left,
    case
      when m.status = 'void' then 'void'
      when m.warranty_end_date < current_date then 'expired'
      else coalesce(m.status, 'active')
    end as status
  from match m
  union all
  select false, null, null, null, null, null
  where not exists (select 1 from match)
  limit 1
$$;

grant execute on function public.check_warranty(text) to anon, authenticated;
