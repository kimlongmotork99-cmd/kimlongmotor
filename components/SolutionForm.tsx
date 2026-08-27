'use client'
import { useState } from 'react'

export default function SolutionForm() {
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
      const res = await fetch('/api/inquiries', {
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

  return (
    <div className="solution-form-card">
      <h3>TƯ VẤN GIẢI PHÁP</h3>
      <p className="muted">Để lại thông tin, chúng tôi sẽ liên hệ và tư vấn giải pháp phù hợp nhất.</p>
      <form className="form" onSubmit={submit}>
        <div className="form-row-2">
          <input className="field" name="name" placeholder="Họ và tên *" required minLength={2} maxLength={120} />
          <input className="field" name="phone" placeholder="Số điện thoại *" required maxLength={20} />
        </div>
        <select className="field" name="vehicle" defaultValue="">
          <option value="" disabled>
            Nhu cầu của bạn
          </option>
          <option value="Fleet Solution">Fleet Solution – Giải pháp đội xe</option>
          <option value="Public Transport">Public Transport – Giao thông công cộng</option>
          <option value="Tourism Transport">Tourism Transport – Vận tải du lịch</option>
          <option value="Corporate Solution">Corporate Solution – Giải pháp doanh nghiệp</option>
        </select>

        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
        />

        <button className="btn primary" type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? 'ĐANG GỬI…' : 'GỬI THÔNG TIN →'}
        </button>

        {status === 'sent' && <p style={{ color: '#b7ef20', fontSize: 13 }}>Đã gửi thành công. Chúng tôi sẽ liên hệ sớm.</p>}
        {status === 'error' && <p style={{ color: '#ff8a80', fontSize: 13 }}>{errorMsg}</p>}
      </form>
    </div>
  )
}
