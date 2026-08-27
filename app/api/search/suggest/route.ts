import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { rateLimit } from '@/lib/rate-limit'
import { getSuggestions } from '@/lib/search'

export const dynamic = 'force-dynamic'

function getClientIp(req: Request) {
  const forwarded = req.headers.get('x-forwarded-for')
  return forwarded?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'
}

export async function GET(req: Request) {
  const ip = getClientIp(req)

  // Autocomplete gọi mỗi lần gõ phím nên giới hạn cao hơn /api/search một chút.
  const { ok } = rateLimit(`suggest:${ip}`, 60, 60_000)
  if (!ok) {
    return NextResponse.json({ suggestions: [] }, { status: 429 })
  }

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') || ''

  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const suggestions = await getSuggestions(sb, q, 6)

  return NextResponse.json({ suggestions })
}
