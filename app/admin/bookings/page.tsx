'use client'
import { useEffect, useState } from 'react'
import RoleGate from '@/components/admin/RoleGate'
import { supabaseBrowser } from '@/lib/supabase'

const STATUS_LABEL: Record<string, string> = {
  new: 'Mới',
  confirmed: 'Đã xác nhận',
  done: 'Hoàn tất',
  cancelled: 'Đã hủy',
}

export default function Bookings() {
  const [rows, setRows] = useState<any[]>([])
  const [centers, setCenters] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('')

  const load = async () => {
    const sb = supabaseBrowser()
    const [{ data: bookings }, { data: centerRows }] = await Promise.all([
      sb.from('service_bookings').select('*').order('created_at', { ascending: false }),
      sb.from('service_centers').select('id,name'),
    ])
    const map: Record<string, string> = {}
    ;(centerRows || []).forEach((c) => (map[c.id] = c.name))
    setCenters(map)
    setRows(bookings || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const setStatus = async (id: string, status: string) => {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)))
    await supabaseBrowser().from('service_bookings').update({ status }).eq('id', id)
  }

  const filtered = filter ? rows.filter((r) => r.status === filter) : rows

  return (
    <RoleGate allow={['admin', 'sales']}>
      <div className="admin-page">
        <div className="page-head">
          <div>
            <span className="eyebrow">SAU BÁN HÀNG</span>
            <h1>Lịch đặt dịch vụ</h1>
            <p>Yêu cầu đặt lịch bảo dưỡng/sửa chữa gửi từ website.</p>
          </div>
        </div>

        <div className="inline-actions" style={{ marginBottom: 16 }}>
          {['', 'new', 'confirmed', 'done', 'cancelled'].map((s) => (
            <button key={s || 'all'} className={`btn${filter === s ? ' primary' : ''}`} onClick={() => setFilter(s)}>
              {s ? STATUS_LABEL[s] : 'Tất cả'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="admin-loading">Đang tải…</div>
        ) : filtered.length === 0 ? (
          <div className="admin-empty">
            <b>Chưa có lịch đặt nào</b>
            <p>Yêu cầu từ trang /book-service sẽ hiển thị tại đây.</p>
          </div>
        ) : (
          <div className="content-page-list">
            {filtered.map((r) => (
              <div className="content-page-row" key={r.id}>
                <div>
                  <b>
                    {r.name} · {r.phone}
                  </b>
                  <small>
                    {r.vehicle || 'Chưa rõ dòng xe'}
                    {r.plate ? ` · Biển số ${r.plate}` : ''}
                    {' · '}
                    {r.service_center_id ? centers[r.service_center_id] || 'Trạm không xác định' : 'Chưa chọn trạm'}
                    {r.preferred_date ? ` · Hẹn ${new Date(r.preferred_date).toLocaleDateString('vi-VN')}` : ''}
                    {r.preferred_time ? ` (${r.preferred_time})` : ''}
                  </small>
                  {r.note && <small style={{ display: 'block', marginTop: 4 }}>Ghi chú: {r.note}</small>}
                </div>
                <select value={r.status} onChange={(e) => setStatus(r.id, e.target.value)}>
                  {Object.entries(STATUS_LABEL).map(([k, label]) => (
                    <option key={k} value={k}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}
      </div>
    </RoleGate>
  )
}
