import type { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Về KIM LONG MOTOR',
  description: 'KIM LONG MOTOR phát triển hệ sinh thái phương tiện và giải pháp vận tải tại Việt Nam, kết hợp năng lực sản xuất, công nghệ và mạng lưới dịch vụ.',
  alternates: { canonical: '/about' },
}

export default function About() {
  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">KIM LONG MOTOR</span>
          <h1>Kiến tạo tương lai di chuyển</h1>
        </div>
      </section>
      <section className="section">
        <div className="container detail">
          <Image
            src="/assets/factory.jpg"
            alt="Khu phức hợp KIM LONG MOTOR"
            width={800}
            height={520}
            style={{ width: '100%', height: 'auto', borderRadius: 12, objectFit: 'cover' }}
          />
          <div>
            <h2>Made in Kim Long</h2>
            <p className="muted">
              KIM LONG MOTOR phát triển hệ sinh thái phương tiện và giải pháp vận tải tại Việt Nam, kết hợp năng lực sản
              xuất, công nghệ và mạng lưới dịch vụ để tạo ra giá trị bền vững cho khách hàng.
            </p>
            <p className="muted">
              Website được thiết kế theo hướng dữ liệu hóa: sản phẩm, thông số, hình ảnh, catalogue và tin tức đều có
              thể quản trị từ CMS.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
