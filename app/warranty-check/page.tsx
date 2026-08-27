import type { Metadata } from 'next'
import WarrantyLookupForm from '@/components/WarrantyLookupForm'

export const metadata: Metadata = {
  title: 'Tra cứu bảo hành',
  description: 'Tra cứu tình trạng bảo hành xe KIM LONG MOTOR bằng số VIN hoặc biển số xe.',
  alternates: { canonical: '/warranty-check' },
}

export default function WarrantyCheck() {
  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">SAU BÁN HÀNG</span>
          <h1>Tra cứu bảo hành</h1>
          <p>Nhập số VIN hoặc biển số xe để kiểm tra thời hạn bảo hành hiện tại.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <WarrantyLookupForm />
        </div>
      </section>
    </main>
  )
}
