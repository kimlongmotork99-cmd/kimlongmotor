import type { MetadataRoute } from 'next'
import { supabaseServer } from '@/lib/supabase-server'
import { siteConfig } from '@/lib/site'

export const revalidate = 3600 // Cập nhật sitemap mỗi giờ

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sb = await supabaseServer()

  const [{ data: products }, { data: news }] = await Promise.all([
    sb.from('products').select('slug,updated_at').eq('status', 'published'),
    sb.from('news').select('slug,published_at').eq('status', 'published'),
  ])

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${siteConfig.url}/`, changeFrequency: 'weekly' as const, priority: 1 },
    { url: `${siteConfig.url}/products`, changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: `${siteConfig.url}/news`, changeFrequency: 'daily' as const, priority: 0.7 },
    { url: `${siteConfig.url}/about`, changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${siteConfig.url}/factory`, changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${siteConfig.url}/technology`, changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${siteConfig.url}/contact`, changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${siteConfig.url}/service`, changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${siteConfig.url}/service-centers`, changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${siteConfig.url}/book-service`, changeFrequency: 'monthly' as const, priority: 0.5 },
  ].map((p) => ({ ...p, lastModified: new Date() }))

  const productPages: MetadataRoute.Sitemap = (products || []).map((p) => ({
    url: `${siteConfig.url}/products/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  const newsPages: MetadataRoute.Sitemap = (news || []).map((n) => ({
    url: `${siteConfig.url}/news/${n.slug}`,
    lastModified: n.published_at ? new Date(n.published_at) : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...productPages, ...newsPages]
}
