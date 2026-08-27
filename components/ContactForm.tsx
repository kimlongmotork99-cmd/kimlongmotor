'use client'
import { useState } from 'react'

export default function ContactForm() {
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
    <form className="form" onSubmit={submit}>
      <input className="field" name="name" placeholder="Họ và tên *" required minLength={2} maxLength={120} />
      <input className="field" name="phone" placeholder="Số điện thoại *" required maxLength={20} />
      <input className="field" name="email" placeholder="Email" type="email" maxLength={160} />
      <input className="field" name="vehicle" placeholder="Dòng xe quan tâm" maxLength={120} />
      <textarea className="field" name="message" placeholder="Nhu cầu của bạn" rows={5} maxLength={2000} />

      {/* Honeypot chống bot - ẩn khỏi người dùng thật bằng CSS, không dùng display:none để tránh một số bot bỏ qua */}
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

      {status === 'sent' && <p>Đã gửi thành công. Chúng tôi sẽ liên hệ sớm.</p>}
      {status === 'error' && <p style={{ color: '#c0392b' }}>{errorMsg}</p>}
    </form>
  )
}
