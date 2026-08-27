import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { rateLimit } from '@/lib/rate-limit'

const PHONE_REGEX = /^[0-9+()\-.\s]{8,20}$/
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

function getClientIp(req: Request) {
  const forwarded = req.headers.get('x-forwarded-for')
  return forwarded?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'
}

export async function POST(req: Request) {
  const ip = getClientIp(req)

  // Chặn spam: tối đa 5 lượt đặt lịch / phút / IP
  const { ok } = rateLimit(`booking:${ip}`, 5, 60_000)
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
    return NextResponse.json({ ok: true })
  }

  const name = String(body.name || '').trim().slice(0, 120)
  const phone = String(body.phone || '').trim().slice(0, 20)
  const email = String(body.email || '').trim().slice(0, 160)
  const vehicle = String(body.vehicle || '').trim().slice(0, 120)
  const plate = String(body.plate || '').trim().slice(0, 20)
  const serviceCenterId = String(body.service_center_id || '').trim().slice(0, 64)
  const preferredDate = String(body.preferred_date || '').trim()
  const preferredTime = String(body.preferred_time || '').trim().slice(0, 20)
  const note = String(body.note || '').trim().slice(0, 2000)

  if (!name || name.length < 2) {
    return NextResponse.json({ error: 'Vui lòng nhập họ và tên hợp lệ' }, { status: 400 })
  }
  if (!phone || !PHONE_REGEX.test(phone)) {
    return NextResponse.json({ error: 'Số điện thoại không hợp lệ' }, { status: 400 })
  }
  if (email && !EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: 'Email không hợp lệ' }, { status: 400 })
  }
  if (preferredDate && !DATE_REGEX.test(preferredDate)) {
    return NextResponse.json({ error: 'Ngày hẹn không hợp lệ' }, { status: 400 })
  }

  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const { error } = await sb.from('service_bookings').insert({
    name,
    phone,
    email: email || null,
    vehicle: vehicle || null,
    plate: plate || null,
    service_center_id: serviceCenterId || null,
    preferred_date: preferredDate || null,
    preferred_time: preferredTime || null,
    note: note || null,
  })

  if (error) {
    return NextResponse.json({ error: 'Không thể gửi yêu cầu, vui lòng thử lại.' }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
