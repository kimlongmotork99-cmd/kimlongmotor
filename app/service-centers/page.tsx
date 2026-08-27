import type { Metadata } from 'next'
import Link from 'next/link'
import { supabaseServer } from '@/lib/supabase-server'

export const metadata: Metadata = {
  title: 'Tìm trạm dịch vụ',
  description: 'Danh sách trạm dịch vụ chính hãng KIM LONG MOTOR trên toàn quốc — địa chỉ, hotline và khu vực phục vụ.',
  alternates: { canonical: '/service-centers' },
}

export default async function ServiceCenters({
  searchParams,
}: {
  searchParams: Promise<{ region?: string }>
}) {
  const { region = '' } = await searchParams
  const sb = await supabaseServer()

  const { data: centers } = await sb
    .from('service_centers')
    .select('id,name,code,region,address,phone,email')
    .eq('status', 'active')
    .order('region')
    .order('name')

  const regions = Array.from(new Set((centers || []).map((c) => c.region).filter(Boolean))) as string[]
  const filtered = region ? (centers || []).filter((c) => c.region === region) : centers || []

  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">SAU BÁN HÀNG</span>
          <h1>Tìm trạm dịch vụ</h1>
          <p>Mạng lưới trạm dịch vụ chính hãng — bảo dưỡng, sửa chữa và phụ tùng chính hãng KIM LONG MOTOR.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {regions.length > 1 && (
            <div className="chip-row" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 28 }}>
              <Link href="/service-centers" className={`btn${!region ? ' primary' : ''}`}>
                Tất cả khu vực
              </Link>
              {regions.map((r) => (
                <Link key={r} href={`/service-centers?region=${encodeURIComponent(r)}`} className={`btn${region === r ? ' primary' : ''}`}>
                  {r}
                </Link>
              ))}
            </div>
          )}

          {filtered.length === 0 ? (
            <p className="muted">
              Chưa có trạm dịch vụ nào phù hợp. Vui lòng <Link href="/book-service">đặt lịch dịch vụ</Link> để chúng
              tôi sắp xếp trạm gần bạn nhất, hoặc <Link href="/contact">liên hệ hotline</Link>.
            </p>
          ) : (
            <div className="service-grid">
              {filtered.map((c) => (
                <article className="mini-card" key={c.id}>
                  <h3>{c.name}</h3>
                  <p>
                    <b>{c.code || '—'}</b> · {c.region || 'Toàn quốc'}
                    <br />
                    {c.address || 'Đang cập nhật địa chỉ'}
                    <br />
                    {c.phone ? <a href={`tel:${c.phone.replace(/\s+/g, '')}`}>{c.phone}</a> : '—'} · {c.email || '—'}
                  </p>
                  <Link href={`/book-service?center=${c.id}`} className="btn">
                    ĐẶT LỊCH TẠI ĐÂY →
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
