import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { supabaseServer } from '@/lib/supabase-server'
import { runSearch, renderSnippetHtml } from '@/lib/search'

export const metadata: Metadata = {
  title: 'Kết quả tìm kiếm',
  robots: { index: false, follow: true }, // Trang kết quả tìm kiếm không cần Google index
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q = '' } = await searchParams
  const sb = await supabaseServer()
  const { count, products, news, degraded } = await runSearch(sb, q, 30)

  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">TÌM KIẾM</span>
          <h1>{q ? `Kết quả cho “${q}”` : 'Tìm kiếm'}</h1>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {q.trim().length < 2 ? (
            <p className="muted">Nhập ít nhất 2 ký tự để tìm kiếm sản phẩm và tin tức.</p>
          ) : count === 0 ? (
            <div>
              <p className="muted">
                Không tìm thấy kết quả nào phù hợp với “{q}”. Thử từ khóa khác hoặc xem{' '}
                <Link href="/products">danh sách sản phẩm</Link>.
              </p>
            </div>
          ) : (
            <>
              <p className="muted" style={{ marginBottom: 28 }}>
                Tìm thấy {count} kết quả phù hợp với “{q}”.
              </p>

              {products.length > 0 && (
                <div style={{ marginBottom: 44 }}>
                  <div className="section-head">
                    <div>
                      <span className="eyebrow">SẢN PHẨM</span>
                      <h2>{products.length} kết quả</h2>
                    </div>
                  </div>
                  <div className="grid">
                    {products.map((p) => (
                      <article className="card" key={p.id}>
                        <Image
                          src={p.image || '/assets/bus.jpg'}
                          alt={p.title}
                          width={400}
                          height={190}
                          style={{ width: '100%', height: 190, objectFit: 'cover' }}
                          sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 25vw"
                        />
                        <div className="card-body">
                          <span className="eyebrow">{p.category}</span>
                          <h3>{p.title}</h3>
                          {p.snippet ? (
                            <p className="muted" dangerouslySetInnerHTML={{ __html: renderSnippetHtml(p.snippet)! }} />
                          ) : (
                            <p className="muted">{p.subtitle}</p>
                          )}
                          <Link href={`/products/${p.slug}`} className="btn">
                            KHÁM PHÁ →
                          </Link>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}

              {news.length > 0 && (
                <div>
                  <div className="section-head">
                    <div>
                      <span className="eyebrow">TIN TỨC</span>
                      <h2>{news.length} kết quả</h2>
                    </div>
                  </div>
                  <div className="grid">
                    {news.map((n) => (
                      <article className="card" key={n.id}>
                        <Image
                          src={n.image || '/assets/news.jpg'}
                          alt={n.title}
                          width={400}
                          height={190}
                          style={{ width: '100%', height: 190, objectFit: 'cover' }}
                          sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 25vw"
                        />
                        <div className="card-body">
                          <span className="eyebrow">{n.category || 'Tin tức'}</span>
                          <h3>{n.title}</h3>
                          {n.snippet ? (
                            <p className="muted" dangerouslySetInnerHTML={{ __html: renderSnippetHtml(n.snippet)! }} />
                          ) : (
                            <p className="muted">{n.subtitle}</p>
                          )}
                          <Link href={`/news/${n.slug}`} className="btn">
                            XEM CHI TIẾT →
                          </Link>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}

              {degraded && (
                <p className="muted" style={{ marginTop: 30, fontSize: 12 }}>
                  * Đang tìm kiếm ở chế độ cơ bản. Chạy các migration <code>supabase/migrations/001_search.sql</code> và{' '}
                  <code>supabase/migrations/002_search_optimize.sql</code> để bật tìm kiếm full-text có dấu/không dấu,
                  gõ dở vẫn ra kết quả, chịu lỗi chính tả và bôi đậm từ khóa khớp.
                </p>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  )
}
