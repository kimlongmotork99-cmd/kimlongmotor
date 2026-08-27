import type { SupabaseClient } from '@supabase/supabase-js'

export type SearchResult = {
  type: 'product' | 'news'
  id: string
  slug: string
  title: string
  subtitle: string | null
  image: string | null
  category: string | null
  rank: number
  // Đoạn trích khớp từ khóa, lấy từ ts_headline (SQL) — chứa marker "@@HL@@"/"@@ENDHL@@" quanh
  // vùng khớp, dùng renderSnippetHtml() để escape + chuyển thành <mark> an toàn trước khi render.
  // null khi đang ở chế độ fallback ILIKE (chưa chạy migration 002_search_optimize.sql).
  snippet: string | null
}

export type Suggestion = {
  type: 'product' | 'news'
  slug: string
  title: string
  category: string | null
}

export type SearchResponse = {
  query: string
  count: number
  results: SearchResult[]
  products: SearchResult[]
  news: SearchResult[]
  degraded: boolean
}

// ts_headline (SQL) đánh dấu vùng khớp bằng các marker vô hại "@@HL@@"/"@@ENDHL@@" thay vì
// chèn thẳng <mark> — vì nội dung gốc (mô tả sản phẩm/tin tức) chưa chắc đã an toàn để render
// bằng dangerouslySetInnerHTML. Hàm này escape toàn bộ HTML rồi mới chèn <mark> ở marker,
// tránh XSS trong khi vẫn bôi đậm được từ khóa khớp.
export function renderSnippetHtml(snippet: string | null): string | null {
  if (!snippet) return null
  const escaped = snippet
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
  return escaped.replace(/@@HL@@/g, '<mark>').replace(/@@ENDHL@@/g, '</mark>')
}

// Loại bỏ dấu tiếng Việt phía JS — dùng cho fallback ILIKE khi chưa chạy migration search_site.
export function normalize(text: string) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, (m) => (m === 'đ' ? 'd' : 'D'))
    .toLowerCase()
    .trim()
}

/**
 * Chạy tìm kiếm trên products + news.
 * Ưu tiên RPC `search_site` (full-text, có trọng số, bỏ dấu, xếp hạng) —
 * nếu chưa chạy migration supabase/migrations/001_search.sql thì tự rơi về ILIKE.
 */
export async function runSearch(sb: SupabaseClient, rawQuery: string, limit = 20): Promise<SearchResponse> {
  const q = rawQuery.trim().slice(0, 100)

  if (q.length < 2) {
    return { query: q, count: 0, results: [], products: [], news: [], degraded: false }
  }

  const { data: rpcData, error: rpcError } = await sb.rpc('search_site', { q, max_results: limit })

  let results: SearchResult[]

  if (!rpcError && rpcData) {
    results = rpcData as SearchResult[]
  } else {
    const nq = normalize(q)
    // PostgREST dùng dấu phẩy/ngoặc để phân tách điều kiện trong .or() — loại bỏ để tránh phá cú pháp filter.
    const safeQ = q.replace(/[,()]/g, ' ').trim()
    const pattern = `%${safeQ}%`

    const [{ data: products }, { data: news }] = await Promise.all([
      sb
        .from('products')
        .select('id,slug,name,tagline,category,hero_image,status')
        .eq('status', 'published')
        .or(`name.ilike.${pattern},tagline.ilike.${pattern},category.ilike.${pattern}`)
        .limit(limit),
      sb
        .from('news')
        .select('id,slug,title,excerpt,category,cover_image,status')
        .eq('status', 'published')
        .or(`title.ilike.${pattern},excerpt.ilike.${pattern},category.ilike.${pattern}`)
        .limit(limit),
    ])

    const productResults: SearchResult[] = (products || [])
      .filter((p) => normalize(`${p.name} ${p.tagline || ''} ${p.category || ''}`).includes(nq))
      .map((p) => ({
        type: 'product' as const,
        id: p.id,
        slug: p.slug,
        title: p.name,
        subtitle: p.tagline,
        image: p.hero_image,
        category: p.category,
        rank: 1,
        snippet: null,
      }))

    const newsResults: SearchResult[] = (news || [])
      .filter((n) => normalize(`${n.title} ${n.excerpt || ''} ${n.category || ''}`).includes(nq))
      .map((n) => ({
        type: 'news' as const,
        id: n.id,
        slug: n.slug,
        title: n.title,
        subtitle: n.excerpt,
        image: n.cover_image,
        category: n.category,
        rank: 1,
        snippet: null,
      }))

    results = [...productResults, ...newsResults].slice(0, limit)
  }

  return {
    query: q,
    count: results.length,
    results,
    products: results.filter((r) => r.type === 'product'),
    news: results.filter((r) => r.type === 'news'),
    degraded: !!rpcError,
  }
}

/**
 * Gợi ý nhanh (autocomplete) khi người dùng đang gõ.
 * Dùng RPC `search_suggest` (prefix + trigram, rất nhẹ) — rơi về ILIKE giới hạn nếu chưa có migration.
 */
export async function getSuggestions(sb: SupabaseClient, rawQuery: string, limit = 6): Promise<Suggestion[]> {
  const q = rawQuery.trim().slice(0, 100)
  if (q.length < 2) return []

  const { data, error } = await sb.rpc('search_suggest', { q, max_results: limit })
  if (!error && data) return data as Suggestion[]

  const nq = normalize(q)
  const safeQ = q.replace(/[,()]/g, ' ').trim()
  const pattern = `%${safeQ}%`

  const [{ data: products }, { data: news }] = await Promise.all([
    sb.from('products').select('slug,name,category').eq('status', 'published').ilike('name', pattern).limit(limit),
    sb.from('news').select('slug,title,category').eq('status', 'published').ilike('title', pattern).limit(limit),
  ])

  const suggestions: Suggestion[] = [
    ...(products || [])
      .filter((p) => normalize(p.name).includes(nq))
      .map((p) => ({ type: 'product' as const, slug: p.slug, title: p.name, category: p.category })),
    ...(news || [])
      .filter((n) => normalize(n.title).includes(nq))
      .map((n) => ({ type: 'news' as const, slug: n.slug, title: n.title, category: n.category })),
  ]

  return suggestions.slice(0, limit)
}
