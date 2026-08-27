import Link from 'next/link'
import { supabaseServer } from '@/lib/supabase-server'
import { IconFacebook, IconYoutube, IconZalo, IconLinkedin } from './icons'

export default async function Footer() {
  const sb = await supabaseServer()
  const { data } = await sb.from('site_settings').select('key,value').in('key', ['brand', 'contact'])
  const map: any = {}
  data?.forEach((x) => (map[x.key] = x.value))

  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <div className="logo">
            <b>{map.brand?.name || 'KIM LONG'}</b>
            <small>MOTOR</small>
          </div>
          <p>
            KIM LONG MOTOR là thương hiệu ô tô Việt Nam, sản xuất và phân phối các dòng xe thương mại, xe buýt,
            minibus, xe du lịch và giải pháp vận tải toàn diện cho tương lai di chuyển xanh.
          </p>
          <div className="footer-social">
            <a href="#" aria-label="Facebook"><IconFacebook size={17} /></a>
            <a href="#" aria-label="Youtube"><IconYoutube size={17} /></a>
            <a href="#" aria-label="Zalo"><IconZalo size={17} /></a>
            <a href="#" aria-label="LinkedIn"><IconLinkedin size={17} /></a>
          </div>
        </div>

        <div>
          <h4>SẢN PHẨM</h4>
          <p>Bus</p>
          <p>City Bus</p>
          <p>Minibus</p>
          <p>Xe thương mại</p>
          <p>Xe du lịch</p>
          <p>Xe điện</p>
        </div>

        <div>
          <h4>CÔNG NGHỆ</h4>
          <p>Động cơ &amp; Truyền động</p>
          <p>Công nghệ xe điện</p>
          <p>Pin &amp; Năng lượng</p>
          <p>An toàn</p>
          <p>Kết nối thông minh</p>
          <p>Nghiên cứu &amp; Phát triển</p>
        </div>

        <div>
          <h4>DỊCH VỤ</h4>
          <p><Link href="/service-centers">Tìm trạm dịch vụ</Link></p>
          <p><Link href="/book-service">Đặt lịch bảo dưỡng</Link></p>
          <p><Link href="/warranty-check">Bảo hành</Link></p>
          <p><Link href="/products">Phụ tùng chính hãng</Link></p>
          <p>Hướng dẫn sử dụng</p>
        </div>

        <div>
          <h4>VỀ KIM LONG</h4>
          <p>Giới thiệu</p>
          <p>Nhà máy</p>
          <p>Năng lực sản xuất</p>
          <p>Đối tác</p>
          <p>Tuyển dụng</p>
        </div>

        <div>
          <h4>LIÊN HỆ</h4>
          <p>Khu phức hợp sản xuất ô tô KIM LONG MOTOR</p>
          <p>Xã Hương Thọ, TP. Huế, Việt Nam</p>
          <p>{map.contact?.email || 'info@kimlongmotor.vn'}</p>
          <p>{map.contact?.hotline || '1900 9898 69'}</p>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>© 2026 KIM LONG MOTOR. All rights reserved.</span>
        <div className="footer-bottom-links">
          <Link href="/contact">Chính sách bảo mật</Link>
          <Link href="/contact">Điều khoản sử dụng</Link>
          <Link href="/contact">Sơ đồ website</Link>
        </div>
      </div>
    </footer>
  )
}
