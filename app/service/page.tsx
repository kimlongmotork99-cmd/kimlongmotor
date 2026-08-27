import type { Metadata } from 'next'
import Link from 'next/link'
import { IconWrench, IconCalendar, IconShield, IconPart } from '@/components/icons'

export const metadata: Metadata = {
  title: 'Dịch vụ sau bán hàng',
  description: 'Tìm trạm dịch vụ, đặt lịch bảo dưỡng và tra cứu bảo hành xe KIM LONG MOTOR.',
  alternates: { canonical: '/service' },
}

const items = [
  { href: '/service-centers', icon: IconWrench, title: 'TÌM TRẠM DỊCH VỤ', desc: 'Trạm dịch vụ gần bạn' },
  { href: '/book-service', icon: IconCalendar, title: 'ĐẶT LỊCH DỊCH VỤ', desc: 'Nhanh chóng, tiện lợi' },
  { href: '/warranty-check', icon: IconShield, title: 'TRA CỨU BẢO HÀNH', desc: 'Nhập biển số / VIN' },
  { href: '/products', icon: IconPart, title: 'PHỤ TÙNG CHÍNH HÃNG', desc: 'Đúng chuẩn, chất lượng' },
]

export default function Service() {
  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">SAU BÁN HÀNG</span>
          <h1>Dịch vụ KIM LONG MOTOR</h1>
          <p>Chăm sóc xe toàn diện — từ tìm trạm dịch vụ, đặt lịch bảo dưỡng đến tra cứu bảo hành.</p>
        </div>
      </section>

      <section className="aftersales" style={{ padding: '48px 0' }}>
        <div className="container">
          <div className="aftersales-grid">
            {items.map(({ href, icon: Icon, title, desc }) => (
              <Link key={href} href={href} className="aftersales-item">
                <Icon />
                <div>
                  <b>{title}</b>
                  <small>{desc}</small>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
