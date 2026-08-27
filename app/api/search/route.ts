import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { rateLimit } from '@/lib/rate-limit'
import { runSearch } from '@/lib/search'

export const dynamic = 'force-dynamic' // Kết quả phụ thuộc query string, không cache tĩnh

function getClientIp(req: Request) {
  const forwarded = req.headers.get('x-forwarded-for')
  return forwarded?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'
}

export async function GET(req: Request) {
  const ip = getClientIp(req)

  // Chặn spam: tối đa 30 lượt tìm kiếm / phút / IP
  const { ok } = rateLimit(`search:${ip}`, 30, 60_000)
  if (!ok) {
    return NextResponse.json({ error: 'Bạn tìm kiếm quá nhiều, vui lòng thử lại sau ít phút.' }, { status: 429 })
  }

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') || ''
  const limitParam = Number(searchParams.get('limit') || 20)
  const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 50) : 20

  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const result = await runSearch(sb, q, limit)

  return NextResponse.json(result)
}
