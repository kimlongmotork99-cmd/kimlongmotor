'use client'
import { useState } from 'react'

type Center = { id: string; name: string; region: string | null }

export default function BookingForm({ centers, defaultCenterId = '' }: { centers: Center[]; defaultCenterId?: string }) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (status === 'sending') return

    setStatus('sending')
    setErrorMsg('')

    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form))

    try {
      const res = await fetch('/api/service-bookings', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      })
      const json = await res.json()

      if (!res.ok) {
        setErrorMsg(json.error || 'Có lỗi xảy ra, vui lòng thử lại.')
        setStatus('error')
        return
      }

      setStatus('sent')
      form.reset()
    } catch {
      setErrorMsg('Không thể kết nối máy chủ, vui lòng thử lại.')
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div className="panel">
        <p>
          <b>Đã ghi nhận lịch hẹn.</b> Đội ngũ dịch vụ sẽ gọi điện xác nhận thời gian cụ thể trong thời gian sớm nhất.
        </p>
        <button className="btn" type="button" onClick={() => setStatus('idle')}>
          Đặt thêm lịch khác
        </button>
      </div>
    )
  }

  return (
    <form className="form" onSubmit={submit}>
      <input className="field" name="name" placeholder="Họ và tên *" required minLength={2} maxLength={120} />
      <input className="field" name="phone" placeholder="Số điện thoại *" required maxLength={20} />
      <input className="field" name="email" placeholder="Email" type="email" maxLength={160} />
      <div className="form-row-2">
        <input className="field" name="vehicle" placeholder="Dòng xe" maxLength={120} />
        <input className="field" name="plate" placeholder="Biển số xe" maxLength={20} />
      </div>

      <label>
        Trạm dịch vụ mong muốn
        <select className="field" name="service_center_id" defaultValue={defaultCenterId}>
          <option value="">Để KIM LONG MOTOR sắp xếp trạm gần nhất</option>
          {centers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
              {c.region ? ` — ${c.region}` : ''}
            </option>
          ))}
        </select>
      </label>

      <div className="form-row-2">
        <label>
          Ngày mong muốn
          <input className="field" name="preferred_date" type="date" min={new Date().toISOString().slice(0, 10)} />
        </label>
        <label>
          Khung giờ
          <select className="field" name="preferred_time" defaultValue="">
            <option value="">Bất kỳ</option>
            <option value="Sáng (8:00 - 11:30)">Sáng (8:00 - 11:30)</option>
            <option value="Chiều (13:30 - 17:00)">Chiều (13:30 - 17:00)</option>
          </select>
        </label>
      </div>

      <textarea className="field" name="note" placeholder="Mô tả tình trạng xe / nội dung cần bảo dưỡng" rows={4} maxLength={2000} />

      {/* Honeypot chống bot */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
      />

      <button className="btn primary" type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'ĐANG GỬI…' : 'ĐẶT LỊCH DỊCH VỤ →'}
      </button>

      {status === 'error' && <p style={{ color: '#c0392b' }}>{errorMsg}</p>}
    </form>
  )
}
