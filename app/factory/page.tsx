import type { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Nhà máy sản xuất',
  description: 'Khu phức hợp sản xuất ô tô KIM LONG MOTOR Huế – hàn robot, sơn ED, lắp ráp và kiểm định theo dây chuyền đồng bộ đạt chuẩn quốc tế.',
  alternates: { canonical: '/factory' },
}

export default function Factory() {
  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">MADE IN KIM LONG</span>
          <h1>Khu phức hợp sản xuất ô tô</h1>
        </div>
      </section>
      <section className="section">
        <div className="container detail">
          <Image
            src="/assets/factory.jpg"
            alt="Nhà máy KIM LONG MOTOR"
            width={800}
            height={520}
            style={{ width: '100%', height: 'auto', borderRadius: 12, objectFit: 'cover' }}
          />
          <div>
            <h2>Quy trình sản xuất hiện đại</h2>
            <p className="muted">
              Hàn robot, xử lý bề mặt, sơn ED, lắp ráp và kiểm định được tổ chức theo dây chuyền đồng bộ, hướng tới
              chất lượng ổn định và khả năng mở rộng.
            </p>
            <ul>
              <li>Hệ thống robot hàn tự động</li>
              <li>Dây chuyền sơn và xử lý bề mặt</li>
              <li>Lắp ráp linh hoạt nhiều dòng xe</li>
              <li>Kiểm tra chất lượng theo từng công đoạn</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  )
}
