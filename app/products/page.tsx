import type { Metadata } from 'next'
import ProductCard from '@/components/ProductCard'
import { supabaseServer } from '@/lib/supabase-server'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Danh mục sản phẩm',
  description: 'Khám phá dòng xe bus, city bus, minibus và xe thương mại của KIM LONG MOTOR – bền bỉ, an toàn, tiết kiệm vận hành.',
  alternates: { canonical: '/products' },
}

export default async function Products() {
  const sb = await supabaseServer()
  const { data } = await sb.from('products').select('*').eq('status', 'published').order('category').order('name')

  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">SẢN PHẨM</span>
          <h1>Danh mục phương tiện</h1>
          <p>Xe bus, city bus, minibus và xe thương mại.</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="grid">
            {data?.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
