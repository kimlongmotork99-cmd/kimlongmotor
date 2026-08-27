import type { Metadata } from 'next'
import ContactForm from '@/components/ContactForm'

export const metadata: Metadata = {
  title: 'Liên hệ & nhận tư vấn',
  description: 'Để lại thông tin, đội ngũ KIM LONG MOTOR sẽ liên hệ tư vấn giải pháp vận tải phù hợp cho bạn.',
  alternates: { canonical: '/contact' },
}

export default function Contact() {
  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">LIÊN HỆ</span>
          <h1>Nhận tư vấn giải pháp</h1>
          <p>Để lại thông tin, đội ngũ KIM LONG MOTOR sẽ liên hệ với bạn.</p>
        </div>
      </section>
      <section className="section">
        <div className="container detail">
          <div>
            <h2>KIM LONG MOTOR</h2>
            <p className="muted">Hotline: 1900 9898 69</p>
            <p className="muted">Email: info@kimlongmotor.vn</p>
            <p className="muted">Huế, Việt Nam</p>
          </div>
          <ContactForm />
        </div>
      </section>
    </main>
  )
}
