import type { Metadata } from 'next'
import NewsCard from '@/components/NewsCard'
import { supabaseServer } from '@/lib/supabase-server'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Tin tức & sự kiện',
  description: 'Cập nhật tin tức, sự kiện và hoạt động mới nhất từ KIM LONG MOTOR.',
  alternates: { canonical: '/news' },
}

export default async function News() {
  const sb = await supabaseServer()
  const { data } = await sb.from('news').select('*').eq('status', 'published').order('published_at', { ascending: false })

  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">MEDIA</span>
          <h1>Tin tức & sự kiện</h1>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="grid">
            {data?.map((n) => (
              <NewsCard key={n.id} n={n} />
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
