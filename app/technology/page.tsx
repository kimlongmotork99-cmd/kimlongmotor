import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Công nghệ & tiêu chuẩn',
  description: 'Công nghệ robot hàn, sơn ED, kiểm soát chất lượng và giải pháp kết nối của KIM LONG MOTOR.',
  alternates: { canonical: '/technology' },
}

const TECH_ITEMS = [
  { title: 'Robot hàn', desc: 'Tự động hóa các công đoạn hàn để nâng cao độ chính xác.' },
  { title: 'Sơn ED', desc: 'Tăng khả năng chống ăn mòn và độ bền bề mặt.' },
  { title: 'An toàn', desc: 'Kiểm soát chất lượng theo từng công đoạn.' },
  { title: 'Connected', desc: 'Sẵn sàng tích hợp dữ liệu đội xe và dịch vụ số.' },
]

export default function Technology() {
  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">TECHNOLOGY</span>
          <h1>Công nghệ & tiêu chuẩn</h1>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="grid">
            {TECH_ITEMS.map((item) => (
              <div className="card" key={item.title}>
                <div className="card-body">
                  <h3>{item.title}</h3>
                  <p className="muted">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
