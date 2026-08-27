import Image from 'next/image'
import Link from 'next/link'
import { supabaseServer } from '@/lib/supabase-server'
import SearchToggle from './SearchToggle'

const DEFAULT_MENU = [
  { label: 'SẢN PHẨM', href: '/products', caret: true },
  { label: 'CÔNG NGHỆ', href: '/technology', caret: true },
  { label: 'GIẢI PHÁP', href: '/solutions', caret: true },
  { label: 'DỊCH VỤ', href: '/service', caret: true },
  { label: 'KIM LONG MOTOR', href: '/about', caret: true },
  { label: 'MEDIA', href: '/news', caret: false },
  { label: 'LIÊN HỆ', href: '/contact', caret: false },
]

export default async function Header() {
  const sb = await supabaseServer()
  const { data } = await sb.from('site_settings').select('key,value').in('key', ['brand', 'contact', 'menu'])

  const map: Record<string, any> = {}
  data?.forEach((x) => (map[x.key] = x.value))

  const menu: { label: string; href: string; caret?: boolean }[] = map.menu?.items || DEFAULT_MENU
  const brandName = map.brand?.name || 'KIM LONG'
  const hotline = map.contact?.hotline || '1900 9898 69'

  return (
    <>
      <div className="topbar">
        <div className="container">Hotline: {hotline} · Hỗ trợ 24/7</div>
      </div>
      <header className="nav">
        <div className="container nav-inner">
          <Link className="logo" href="/">
            {map.brand?.logo ? (
              <Image src={map.brand.logo} alt={brandName} width={140} height={36} style={{ height: 36, width: 'auto' }} priority />
            ) : (
              <>
                <b>{brandName}</b>
                <small>MOTOR</small>
              </>
            )}
          </Link>
          <nav className="navlinks">
            {menu.map((m) => (
              <Link key={m.href} href={m.href}>
                {m.label}
                {m.caret && <i className="caret" />}
              </Link>
            ))}
          </nav>
          <div className="nav-right">
            <SearchToggle />
            <Link className="btn primary" href="/contact">
              TƯ VẤN NGAY →
            </Link>
          </div>
        </div>
      </header>
    </>
  )
}
