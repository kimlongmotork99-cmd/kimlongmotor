# KIM LONG MOTOR V3.1 CMS

CMS quản trị website theo mô hình doanh nghiệp: Sản phẩm, Tin tức, Media, Khách hàng, Thiết lập, Người dùng.

## Chức năng
- Kéo-thả gallery ảnh và upload ảnh/PDF vào Supabase Storage.
- Bảng thông số kỹ thuật có thể thêm/xóa dòng.
- Upload catalogue PDF trực tiếp trong sản phẩm.
- Quản lý banner homepage, logo, hotline, email, menu và SEO.
- Phân quyền Admin / Biên tập viên / Kinh doanh.
- Admin có thể mời tài khoản mới và đổi vai trò.
- Nội dung website đọc từ Supabase nên không cần sửa code khi thêm xe/tin.

## Supabase
1. Tạo project Supabase.
2. Chạy toàn bộ `supabase/schema.sql` trong SQL Editor.
3. Tạo user đầu tiên trong Authentication.
4. Promote user đầu tiên thành Admin bằng câu SQL cuối file schema.
5. Tạo `.env.local` từ `.env.example`.
6. `SUPABASE_SERVICE_ROLE_KEY` chỉ dùng server-side cho chức năng mời user.

## Chạy
npm install
npm run dev

Website: http://localhost:3000
CMS: http://localhost:3000/login

## Vai trò
- Admin: toàn quyền.
- Biên tập viên: sản phẩm, tin tức, media.
- Kinh doanh: sản phẩm và khách hàng.
