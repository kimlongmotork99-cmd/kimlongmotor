'use client'
import { useState } from 'react'

type WarrantyResult = {
  found: boolean
  product_name: string | null
  purchase_date: string | null
  warranty_end_date: string | null
  months_left: number | null
  status: 'active' | 'expired' | 'void' | null
}

const STATUS_LABEL: Record<string, string> = {
  active: 'CÒN BẢO HÀNH',
  expired: 'HẾT HẠN BẢO HÀNH',
  void: 'ĐÃ HỦY BẢO HÀNH',
}

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('vi-VN')
}

export default function WarrantyLookupForm() {
  const [code, setCode] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [result, setResult] = useState<WarrantyResult | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const value = code.trim()
    if (value.length < 4 || status === 'loading') return

    setStatus('loading')
    setErrorMsg('')
    setResult(null)

    try {
      const res = await fetch(`/api/warranty/check?code=${encodeURIComponent(value)}`)
      const json = await res.json()

      if (!res.ok) {
        setErrorMsg(json.error || 'Không thể tra cứu, vui lòng thử lại.')
        setStatus('error')
        return
      }

      setResult(json)
      setStatus('done')
    } catch {
      setErrorMsg('Không thể kết nối máy chủ, vui lòng thử lại.')
      setStatus('error')
    }
  }

  return (
    <div>
      <form className="form" onSubmit={submit} style={{ maxWidth: 460 }}>
        <input
          className="field"
          name="code"
          placeholder="Nhập số VIN hoặc biển số xe"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
          minLength={4}
          maxLength={40}
        />
        <button className="btn primary" type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? 'ĐANG TRA CỨU…' : 'TRA CỨU BẢO HÀNH →'}
        </button>
        {status === 'error' && <p style={{ color: '#c0392b' }}>{errorMsg}</p>}
      </form>

      {status === 'done' && result && (
        <div className="panel" style={{ marginTop: 24, maxWidth: 460 }}>
          {!result.found ? (
            <p>
              Không tìm thấy dữ liệu bảo hành cho <b>{code.trim()}</b>. Vui lòng kiểm tra lại số VIN/biển số hoặc liên
              hệ trạm dịch vụ gần bạn để được hỗ trợ.
            </p>
          ) : (
            <>
              <span className="eyebrow">{result.status ? STATUS_LABEL[result.status] : ''}</span>
              <h3 style={{ margin: '6px 0' }}>{result.product_name}</h3>
              <p className="muted" style={{ margin: 0 }}>
                Ngày mua: {formatDate(result.purchase_date)}
                <br />
                Hết hạn bảo hành: {formatDate(result.warranty_end_date)}
                {result.status === 'active' && result.months_left != null && (
                  <>
                    <br />
                    Còn khoảng {result.months_left} tháng bảo hành.
                  </>
                )}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  )
}
