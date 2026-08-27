import type { Metadata } from 'next'
import { supabaseServer } from '@/lib/supabase-server'
import BookingForm from '@/components/BookingForm'

export const metadata: Metadata = {
  title: 'Đặt lịch dịch vụ',
  description: 'Đặt lịch bảo dưỡng, sửa chữa xe KIM LONG MOTOR tại trạm dịch vụ gần bạn — nhanh chóng và tiện lợi.',
  alternates: { canonical: '/book-service' },
}

export default async function BookService({
  searchParams,
}: {
  searchParams: Promise<{ center?: string }>
}) {
  const { center = '' } = await searchParams
  const sb = await supabaseServer()
  const { data: centers } = await sb
    .from('service_centers')
    .select('id,name,region')
    .eq('status', 'active')
    .order('region')
    .order('name')

  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">SAU BÁN HÀNG</span>
          <h1>Đặt lịch dịch vụ</h1>
          <p>Để lại thông tin, đội ngũ kỹ thuật sẽ liên hệ xác nhận lịch hẹn bảo dưỡng/sửa chữa phù hợp với bạn.</p>
        </div>
      </section>

      <section className="section">
        <div className="container detail">
          <div>
            <h2>Vì sao nên đặt lịch trước?</h2>
            <p className="muted">Chủ động thời gian, không phải chờ đợi.</p>
            <p className="muted">Kỹ thuật viên chuẩn bị sẵn phụ tùng theo dòng xe của bạn.</p>
            <p className="muted">Hotline hỗ trợ 24/7: 1900 9898 69</p>
          </div>
          <BookingForm centers={centers || []} defaultCenterId={center} />
        </div>
      </section>
    </main>
  )
}
