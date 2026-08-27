import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase-server'
import { siteConfig, toMetaDescription, toAbsoluteUrl } from '@/lib/site'

export const revalidate = 600 // ISR 10 phút

type Props = { params: Promise<{ slug: string }> }

async function getProduct(slug: string) {
  const sb = await supabaseServer()
  const { data } = await sb.from('products').select('*').eq('slug', slug).single()
  if (!data || data.status !== 'published') return null
  return data
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const p = await getProduct(slug)
  if (!p) return { title: 'Không tìm thấy sản phẩm' }

  const title = `${p.name}${p.tagline ? ` – ${p.tagline}` : ''}`
  const description = toMetaDescription(p.description, `Thông tin, thông số kỹ thuật và catalogue ${p.name} từ KIM LONG MOTOR.`)
  const image = toAbsoluteUrl(p.hero_image, '/assets/bus.jpg')

  return {
    title,
    description,
    alternates: { canonical: `/products/${p.slug}` },
    openGraph: { title, description, images: [image], url: `${siteConfig.url}/products/${p.slug}`, type: 'website' },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const p = await getProduct(slug)
  if (!p) return notFound()

  const specs = Array.isArray(p.specs) ? p.specs : Object.entries(p.specs || {}).map(([label, value]) => ({ label, value }))
  const gallery: string[] = p.gallery || []

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: p.description || p.tagline || undefined,
    image: toAbsoluteUrl(p.hero_image, '/assets/bus.jpg'),
    brand: { '@type': 'Brand', name: siteConfig.name },
    ...(p.price ? { offers: { '@type': 'Offer', priceCurrency: 'VND', price: p.price, availability: 'https://schema.org/InStock' } } : {}),
  }

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />

      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">{p.category}</span>
          <h1>{p.name}</h1>
          <p>{p.tagline}</p>
        </div>
      </section>

      <section className="section">
        <div className="container detail">
          <div>
            <Image
              src={p.hero_image || '/assets/bus.jpg'}
              alt={p.name}
              width={800}
              height={520}
              priority
              style={{ width: '100%', height: 'auto', borderRadius: 12, objectFit: 'cover' }}
            />
            {gallery.length > 0 && (
              <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                {gallery.map((src) => (
                  <Image key={src} src={src} alt={`${p.name} - ảnh thực tế`} width={100} height={70} style={{ objectFit: 'cover' }} />
                ))}
              </div>
            )}
          </div>
          <div>
            <h2>{p.tagline}</h2>
            <p className="muted">{p.description}</p>
            {p.price_label && <h3>{p.price_label}</h3>}
            {p.price && <h3>{new Intl.NumberFormat('vi-VN').format(p.price)} ₫</h3>}
            <div className="specs">
              {specs.map((r: any, i: number) => (
                <div key={i} style={{ display: 'contents' }}>
                  <div>{r.label}</div>
                  <div>{String(r.value)}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <Link className="btn primary" href="/contact">
                NHẬN TƯ VẤN →
              </Link>
              {p.catalogue_url && (
                <a className="btn" href={p.catalogue_url} target="_blank" rel="noopener noreferrer">
                  CATALOGUE ↓
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
