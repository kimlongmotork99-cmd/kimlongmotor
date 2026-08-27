import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/lib/types'

export default function ProductCard({ p }: { p: Product }) {
  return (
    <article className="card">
      <Image
        src={p.hero_image || '/assets/bus.jpg'}
        alt={p.name}
        width={400}
        height={190}
        style={{ width: '100%', height: 190, objectFit: 'cover' }}
        sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 25vw"
      />
      <div className="card-body">
        <span className="eyebrow">{p.category}</span>
        <h3>{p.name}</h3>
        <p className="muted">{p.tagline}</p>
        <Link href={`/products/${p.slug}`} className="btn">
          KHÁM PHÁ →
        </Link>
      </div>
    </article>
  )
}
