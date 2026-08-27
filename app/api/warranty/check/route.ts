import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { rateLimit } from '@/lib/rate-limit'

function getClientIp(req: Request) {
  const forwarded = req.headers.get('x-forwarded-for')
  return forwarded?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'
}

export async function GET(req: Request) {
  const ip = getClientIp(req)

  // Chống dò quét hàng loạt VIN/biển số: giới hạn chặt hơn tìm kiếm thường.
  const { ok } = rateLimit(`warranty:${ip}`, 15, 60_000)
  if (!ok) {
    return NextResponse.json({ error: 'Bạn tra cứu quá nhiều lần, vui lòng thử lại sau ít phút.' }, { status: 429 })
  }

  const { searchParams } = new URL(req.url)
  const code = (searchParams.get('code') || '').trim().slice(0, 40)

  if (code.length < 4) {
    return NextResponse.json({ error: 'Vui lòng nhập đầy đủ số VIN hoặc biển số.' }, { status: 400 })
  }

  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const { data, error } = await sb.rpc('check_warranty', { code }).single()

  if (error) {
    return NextResponse.json(
      { error: 'Chưa thể tra cứu bảo hành. Vui lòng chạy migration supabase/migrations/003_service_features.sql.' },
      { status: 503 }
    )
  }

  return NextResponse.json(data)
}
