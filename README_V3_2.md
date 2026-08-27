# KIM LONG MOTOR V3.2 — ERP Mini CMS

Nâng cấp từ V3.1 với:
- Dashboard KPI và pipeline doanh số/lead.
- CRM Kanban: New → Contacted → Qualified → Proposal → Won/Lost.
- Đại lý và trạm dịch vụ.
- Catalogue PDF theo phiên bản sản phẩm.
- Banner trang chủ kéo-thả, sắp xếp slide, draft/published.
- Content Builder bằng block: hero, text, image, gallery, stats, CTA, products, news.
- Preview trang trước khi xuất bản.
- Giữ Next.js + React + Supabase + Vercel.

## Cài đặt
1. `npm install`
2. Tạo project Supabase.
3. Chạy toàn bộ `supabase/schema.sql` trong SQL Editor.
4. Tạo `.env.local` từ `.env.example`.
5. `npm run dev`

## Routes CMS
- `/admin` dashboard
- `/admin/inquiries` CRM / leads
- `/admin/dealers` đại lý
- `/admin/services` trạm dịch vụ
- `/admin/catalogues` catalogue
- `/admin/banners` banner
- `/admin/content` content builder
- `/preview/:id` preview

## Phân quyền
- Admin: toàn quyền.
- Biên tập viên: sản phẩm, tin tức, media, banner, content, catalogue, trạm dịch vụ.
- Kinh doanh: sản phẩm, CRM, đại lý.

## Ghi chú
`deal_value` trên lead là giá trị cơ hội để dashboard tính pipeline và doanh số đã chốt (`won`). Có thể mở rộng sang bảng đơn hàng/hợp đồng khi cần ERP đầy đủ.
