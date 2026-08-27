import Image from 'next/image'
import Link from 'next/link'
import type { News } from '@/lib/types'

export default function NewsCard({ n }: { n: News }) {
  return (
    <article className="card">
      <Image
        src={n.cover_image || '/assets/news.jpg'}
        alt={n.title}
        width={400}
        height={190}
        style={{ width: '100%', height: 190, objectFit: 'cover' }}
        sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 25vw"
      />
      <div className="card-body">
        <span className="eyebrow">{n.category || 'Tin tức'}</span>
        <h3>{n.title}</h3>
        <p className="muted">{n.excerpt}</p>
        <Link href={`/news/${n.slug}`} className="btn">
          XEM CHI TIẾT →
        </Link>
      </div>
    </article>
  )
}
