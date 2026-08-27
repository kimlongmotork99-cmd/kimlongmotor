import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase-server'
import { siteConfig, toMetaDescription, toAbsoluteUrl } from '@/lib/site'

export const revalidate = 600

type Props = { params: Promise<{ slug: string }> }

async function getArticle(slug: string) {
  const sb = await supabaseServer()
  const { data } = await sb.from('news').select('*').eq('slug', slug).single()
  if (!data || data.status !== 'published') return null
  return data
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const n = await getArticle(slug)
  if (!n) return { title: 'Không tìm thấy bài viết' }

  const description = toMetaDescription(n.excerpt || n.content)
  const image = toAbsoluteUrl(n.cover_image, '/assets/news.jpg')

  return {
    title: n.title,
    description,
    alternates: { canonical: `/news/${n.slug}` },
    openGraph: {
      title: n.title,
      description,
      images: [image],
      url: `${siteConfig.url}/news/${n.slug}`,
      type: 'article',
      publishedTime: n.published_at || undefined,
    },
    twitter: { card: 'summary_large_image', title: n.title, description, images: [image] },
  }
}

export default async function NewsDetail({ params }: Props) {
  const { slug } = await params
  const n = await getArticle(slug)
  if (!n) return notFound()

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: n.title,
    description: n.excerpt || undefined,
    image: [toAbsoluteUrl(n.cover_image, '/assets/news.jpg')],
    datePublished: n.published_at || n.created_at,
    dateModified: n.published_at || n.created_at,
    author: { '@type': 'Organization', name: siteConfig.name },
    publisher: { '@type': 'Organization', name: siteConfig.name },
  }

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />

      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">{n.category || 'Tin tức'}</span>
          <h1>{n.title}</h1>
          <p>{n.published_at ? new Date(n.published_at).toLocaleDateString('vi-VN') : ''}</p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: 900 }}>
          <Image
            src={n.cover_image || '/assets/news.jpg'}
            alt={n.title}
            width={900}
            height={500}
            priority
            style={{ width: '100%', height: 'auto', borderRadius: 12, objectFit: 'cover' }}
          />
          <p style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.6 }}>{n.excerpt}</p>
          <div style={{ fontSize: 16, lineHeight: 1.9, whiteSpace: 'pre-wrap' }}>{n.content}</div>
        </div>
      </section>
    </main>
  )
}
