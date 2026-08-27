import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { rateLimit } from '@/lib/rate-limit'

const PHONE_REGEX = /^[0-9+()\-.\s]{8,20}$/
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function getClientIp(req: Request) {
  const forwarded = req.headers.get('x-forwarded-for')
  return forwarded?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'
}

export async function POST(req: Request) {
  const ip = getClientIp(req)

  // Chặn spam: tối đa 5 lượt gửi / phút / IP
  const { ok } = rateLimit(`inquiry:${ip}`, 5, 60_000)
  if (!ok) {
    return NextResponse.json({ error: 'Bạn gửi quá nhiều yêu cầu, vui lòng thử lại sau ít phút.' }, { status: 429 })
  }

  let body: Record<string, any>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 })
  }

  // Honeypot: input ẩn "website" - bot thường tự điền, người dùng thật để trống
  if (body.website) {
    return NextResponse.json({ ok: true }) // âm thầm chấp nhận để không lộ cơ chế chống bot
  }

  const name = String(body.name || '').trim().slice(0, 120)
  const phone = String(body.phone || '').trim().slice(0, 20)
  const email = String(body.email || '').trim().slice(0, 160)
  const vehicle = String(body.vehicle || '').trim().slice(0, 120)
  const message = String(body.message || '').trim().slice(0, 2000)

  if (!name || name.length < 2) {
    return NextResponse.json({ error: 'Vui lòng nhập họ và tên hợp lệ' }, { status: 400 })
  }
  if (!phone || !PHONE_REGEX.test(phone)) {
    return NextResponse.json({ error: 'Số điện thoại không hợp lệ' }, { status: 400 })
  }
  if (email && !EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: 'Email không hợp lệ' }, { status: 400 })
  }

  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const { error } = await sb.from('inquiries').insert({ name, phone, email: email || null, vehicle: vehicle || null, message: message || null })

  if (error) {
    return NextResponse.json({ error: 'Không thể gửi yêu cầu, vui lòng thử lại.' }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
