-- Cho phép khách truy cập website (chưa đăng nhập) xem được các đại lý đang hoạt động,
-- để khối "Tìm Showroom gần bạn" ở trang chủ có thể hiển thị đại lý (showroom) công khai.
-- Trước đây bảng dealers chỉ cho nhân viên (staff) đã đăng nhập xem, giống service_centers
-- đã có sẵn chính sách public từ trước.

drop policy if exists "public dealers" on public.dealers;
create policy "public dealers" on public.dealers
  for select using (status = 'active' or public.is_staff());
