import './globals.css'
import type { Metadata, Viewport } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { supabaseServer } from '@/lib/supabase-server'
import { siteConfig, toMetaDescription } from '@/lib/site'

export const viewport: Viewport = {
  // Cố định chiều rộng viewport = 1280px (thay vì 'device-width').
  // Nhờ vậy trên điện thoại, trình duyệt sẽ render đúng layout desktop
  // (các @media(max-width:...) trong globals.css sẽ KHÔNG kích hoạt),
  // sau đó tự thu nhỏ để vừa màn hình. Người dùng vẫn có thể zoom tay.
  width: 1280,
  themeColor: '#0b1114',
}

export async function generateMetadata(): Promise<Metadata> {
  let title = siteConfig.defaultTitle
  let description = siteConfig.defaultDescription
  let keywords = ''

  try {
    const sb = await supabaseServer()
    const { data } = await sb.from('site_settings').select('value').eq('key', 'seo').single()
    if (data?.value?.title) title = data.value.title
    if (data?.value?.description) description = toMetaDescription(data.value.description)
    if (data?.value?.keywords) keywords = data.value.keywords
  } catch {
    // Dùng giá trị mặc định nếu Supabase chưa cấu hình / lỗi mạng
  }

  return {
    metadataBase: new URL(siteConfig.url),
    title: { default: title, template: `%s | ${siteConfig.name}` },
    description,
    keywords: keywords || undefined,
    alternates: { canonical: '/' },
    openGraph: {
      type: 'website',
      locale: siteConfig.locale,
      url: siteConfig.url,
      siteName: siteConfig.name,
      title,
      description,
      images: [{ url: '/assets/hero.jpg', width: 1200, height: 630, alt: siteConfig.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/assets/hero.jpg'],
    },
    robots: { index: true, follow: true },
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/assets/hero.jpg`,
    contactPoint: [
      { '@type': 'ContactPoint', telephone: '1900-9898-69', contactType: 'customer service', areaServed: 'VN', availableLanguage: ['vi'] },
    ],
    sameAs: [],
  }

  return (
    <html lang="vi">
      <body>
        {/* JSON-LD Organization giúp Google hiểu thương hiệu, hiện Knowledge Panel/sitelinks */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  )
}
