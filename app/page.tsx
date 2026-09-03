import Image from 'next/image'
import Link from 'next/link'
import ProductCard from '@/components/ProductCard'
import NewsCard from '@/components/NewsCard'
import HeroCarousel, { type HeroSlide } from '@/components/HeroCarousel'
import VideoButton from '@/components/VideoButton'
import SolutionForm from '@/components/SolutionForm'
import ShowroomFinder from '@/components/ShowroomFinder'
import { IconFleet, IconBusOutline, IconTourism, IconCorporate, IconWrench, IconCalendar, IconShield, IconPart, IconPhone } from '@/components/icons'
import { supabaseServer } from '@/lib/supabase-server'

export const revalidate = 300 // ISR: cache 5 phút, giảm tải Supabase thay vì query mỗi request

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    image: '/assets/hero.jpg',
    subtitle: 'ENGINEERED TO MOVE',
    title: 'KIM LONG MOTOR',
    description:
      'Kiến tạo những phương tiện vận tải hiện đại, an toàn và thân thiện môi trường – vì một tương lai di chuyển tốt đẹp hơn.',
    ctaLabel: 'KHÁM PHÁ SẢN PHẨM',
    ctaHref: '/products',
  },
  {
    image: '/assets/bus.jpg',
    subtitle: 'KIMLONG 99',
    title: 'ĐẲNG CẤP – AN TOÀN – HIỆU QUẢ',
    description: 'Dòng xe bus cao cấp, vận hành êm ái trên mọi hành trình đường dài.',
    ctaLabel: 'KHÁM PHÁ KIMLONG 99',
    ctaHref: '/products',
  },
  {
    image: '/assets/city.jpg',
    subtitle: 'KIMLONG ELECTRIC',
    title: 'GIẢI PHÁP GIAO THÔNG XANH',
    description: 'Xe buýt điện đô thị – giảm phát thải, tối ưu chi phí vận hành cho đô thị thông minh.',
    ctaLabel: 'TÌM HIỂU THÊM',
    ctaHref: '/products',
  },
  {
    image: '/assets/fleet.jpg',
    subtitle: 'GIẢI PHÁP VẬN TẢI',
    title: 'ĐỒNG HÀNH CÙNG DOANH NGHIỆP',
    description: 'Giải pháp đội xe, vận tải du lịch và vận tải doanh nghiệp toàn diện trên cả nước.',
    ctaLabel: 'KHÁM PHÁ GIẢI PHÁP',
    ctaHref: '#solutions',
  },
]

export default async function Home() {
  const sb = await supabaseServer()

  const [{ data: products }, { data: news }, { data: banners }] = await Promise.all([
    sb.from('products').select('*').eq('status', 'published').order('featured', { ascending: false }).limit(8),
    sb.from('news').select('*').eq('status', 'published').order('published_at', { ascending: false }).limit(4),
    sb.from('home_banners').select('*').eq('status', 'published').order('sort_order'),
  ])

  const slides: HeroSlide[] =
    banners && banners.length > 0
      ? banners.map((b: any) => ({
          image: b.image_url || '/assets/hero.jpg',
          subtitle: b.subtitle || 'ENGINEERED TO MOVE',
          title: b.title || 'KIM LONG MOTOR',
          description:
            'Kiến tạo những phương tiện vận tải hiện đại, an toàn và thân thiện môi trường – vì một tương lai di chuyển tốt đẹp hơn.',
          ctaLabel: b.cta_label || 'KHÁM PHÁ SẢN PHẨM',
          ctaHref: b.cta_url || '/products',
        }))
      : DEFAULT_SLIDES

  return (
    <main>
      <HeroCarousel slides={slides} />

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">DÒNG SẢN PHẨM</span>
              <h2>Phương tiện cho mọi hành trình</h2>
            </div>
            <Link href="/products">Xem tất cả →</Link>
          </div>
          <div className="grid">
            {products?.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        </div>
      </section>

      <section className="section factory" id="factory">
        <Image className="factory-bg" src="/assets/factory.jpg" alt="Nhà máy KIM LONG MOTOR" fill sizes="100vw" loading="lazy" />
        <div className="container factory-inner">
          <div style={{ maxWidth: 560 }}>
            <span className="eyebrow">MADE IN KIM LONG</span>
            <h2>KHU PHỨC HỢP SẢN XUẤT Ô TÔ KIM LONG MOTOR HUẾ</h2>
            <p>
              Tổ hợp sản xuất hiện đại hàng đầu Việt Nam với quy mô hơn 600 ha, công nghệ tiên tiến, tự động hóa
              cao, sản phẩm đạt tiêu chuẩn quốc tế.
            </p>
            <Link className="btn" href="/factory">
              KHÁM PHÁ NHÀ MÁY →
            </Link>
          </div>
          <VideoButton videoUrl="https://www.youtube.com/embed/dQw4w9WgXcQ" label="XEM VIDEO GIỚI THIỆU" />
        </div>
      </section>

      <div className="stats">
        <div className="stat">
          <strong>600+</strong>HA
          <small>Quy mô khu phức hợp</small>
        </div>
        <div className="stat">
          <strong>100.000+</strong>XE/NĂM
          <small>Công suất thiết kế</small>
        </div>
        <div className="stat">
          <strong>2.000+</strong>NHÂN SỰ
          <small>Đội ngũ chuyên môn cao</small>
        </div>
        <div className="stat">
          <strong>500+</strong>ROBOT
          <small>Hệ thống sản xuất hiện đại</small>
        </div>
        <div className="stat">
          <strong>ISO</strong>TIÊU CHUẨN
          <small>Tiêu chuẩn quốc tế</small>
        </div>
      </div>

      <section className="section" id="solutions">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">GIẢI PHÁP VẬN TẢI TOÀN DIỆN</span>
              <h2>Đồng hành cùng doanh nghiệp</h2>
              <p className="muted" style={{ maxWidth: 520 }}>
                KIM LONG MOTOR cung cấp giải pháp vận tải toàn diện cho doanh nghiệp và đối tác.
              </p>
              <Link className="btn primary" href="/contact" style={{ marginTop: 14 }}>
                KHÁM PHÁ GIẢI PHÁP →
              </Link>
            </div>
          </div>

          <div className="solution-icons">
            <div className="solution-icon">
              <IconFleet />
              <span>FLEET SOLUTION</span>
              <small>Giải pháp đội xe</small>
            </div>
            <div className="solution-icon">
              <IconBusOutline />
              <span>PUBLIC TRANSPORT</span>
              <small>Giao thông công cộng</small>
            </div>
            <div className="solution-icon">
              <IconTourism />
              <span>TOURISM TRANSPORT</span>
              <small>Vận tải du lịch</small>
            </div>
            <div className="solution-icon">
              <IconCorporate />
              <span>CORPORATE SOLUTION</span>
              <small>Giải pháp doanh nghiệp</small>
            </div>
          </div>

          <div className="solution-layout">
            <div className="fleet-showcase">
              <Image src="/assets/fleet-solution.webp" alt="Đội xe KIM LONG MOTOR" fill sizes="(max-width: 900px) 100vw, 60vw" style={{ objectFit: 'cover' }} loading="lazy" />
            </div>
            <SolutionForm />
          </div>
        </div>
      </section>

      <ShowroomFinder />

      <section className="section" id="news">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">TIN TỨC & SỰ KIỆN</span>
              <h2>Điểm tin KIM LONG MOTOR</h2>
            </div>
            <Link href="/news">Xem tất cả →</Link>
          </div>
          <div className="grid">
            {news?.map((n) => (
              <NewsCard key={n.id} n={n} />
            ))}
          </div>
        </div>
      </section>

      <section className="aftersales">
        <div className="container aftersales-inner">
          <div className="aftersales-grid">
            <Link href="/service-centers" className="aftersales-item">
              <IconWrench />
              <div>
                <b>TÌM TRẠM DỊCH VỤ</b>
                <small>Trạm dịch vụ gần bạn</small>
              </div>
            </Link>
            <Link href="/book-service" className="aftersales-item">
              <IconCalendar />
              <div>
                <b>ĐẶT LỊCH DỊCH VỤ</b>
                <small>Nhanh chóng, tiện lợi</small>
              </div>
            </Link>
            <Link href="/warranty-check" className="aftersales-item">
              <IconShield />
              <div>
                <b>TRA CỨU BẢO HÀNH</b>
                <small>Nhập biển số / VIN</small>
              </div>
            </Link>
            <Link href="/products" className="aftersales-item">
              <IconPart />
              <div>
                <b>PHỤ TÙNG CHÍNH HÃNG</b>
                <small>Đúng chuẩn, chất lượng</small>
              </div>
            </Link>
          </div>
          <a href="tel:19009898069" className="aftersales-hotline">
            <IconPhone size={18} />
            <div>
              <b>1900 9898 69</b>
              <small>Hỗ trợ 24/7</small>
            </div>
          </a>
        </div>
      </section>
    </main>
  )
}
