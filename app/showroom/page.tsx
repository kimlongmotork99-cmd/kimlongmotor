import type { Metadata } from 'next'
import Link from 'next/link'
import { supabaseServer } from '@/lib/supabase-server'

export const metadata: Metadata = {
  title: 'Tìm showroom & trạm dịch vụ',
  description: 'Danh sách showroom (đại lý) và trạm dịch vụ chính hãng KIM LONG MOTOR trên toàn quốc.',
  alternates: { canonical: '/showroom' },
}

type Row = {
  id: string
  name: string
  region: string | null
  address: string | null
  phone: string | null
  email: string | null
  type: 'Showroom' | 'Trạm dịch vụ'
}

export default async function ShowroomPage({
  searchParams,
}: {
  searchParams: Promise<{ region?: string; district?: string }>
}) {
  const { region = '', district = '' } = await searchParams
  const sb = await supabaseServer()

  const [{ data: dealers }, { data: centers }] = await Promise.all([
    sb.from('dealers').select('id,name,region,address,phone,email').eq('status', 'active'),
    sb.from('service_centers').select('id,name,region,address,phone,email').eq('status', 'active'),
  ])

  let rows: Row[] = [
    ...(dealers || []).map((d: any) => ({ ...d, type: 'Showroom' as const })),
    ...(centers || []).map((c: any) => ({ ...c, type: 'Trạm dịch vụ' as const })),
  ]

  if (region) rows = rows.filter((r) => r.region === region)
  if (district) rows = rows.filter((r) => (r.address || '').toLowerCase().includes(district.toLowerCase()))

  rows.sort((a, b) => (a.region || '').localeCompare(b.region || '') || a.name.localeCompare(b.name))

  const regions = Array.from(
    new Set(
      [...(dealers || []), ...(centers || [])].map((r: any) => r.region).filter(Boolean)
    )
  ) as string[]

  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">HỆ THỐNG SHOWROOM &amp; TRẠM DỊCH VỤ</span>
          <h1>Tìm showroom gần bạn</h1>
          <p>Mạng lưới showroom và trạm dịch vụ chính hãng KIM LONG MOTOR trên toàn quốc.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {regions.length > 1 && (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 28 }}>
              <Link href="/showroom" className={`btn${!region ? ' primary' : ''}`}>
                Tất cả khu vực
              </Link>
              {regions.map((r) => (
                <Link key={r} href={`/showroom?region=${encodeURIComponent(r)}`} className={`btn${region === r ? ' primary' : ''}`}>
                  {r}
                </Link>
              ))}
            </div>
          )}

          {rows.length === 0 ? (
            <p className="muted">
              Chưa tìm thấy showroom/trạm dịch vụ phù hợp. Vui lòng <Link href="/contact">liên hệ hotline</Link> để
              được hỗ trợ tìm địa điểm gần bạn nhất.
            </p>
          ) : (
            <div className="service-grid">
              {rows.map((r) => (
                <article className="mini-card" key={`${r.type}-${r.id}`}>
                  <span className="pill green" style={{ marginBottom: 8, display: 'inline-block' }}>
                    {r.type}
                  </span>
                  <h3>{r.name}</h3>
                  <p>
                    {r.region || 'Toàn quốc'}
                    <br />
                    {r.address || 'Đang cập nhật địa chỉ'}
                    <br />
                    {r.phone ? <a href={`tel:${r.phone.replace(/\s+/g, '')}`}>{r.phone}</a> : '—'} · {r.email || '—'}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
