'use client'
import { useEffect, useState } from 'react'
import RoleGate from '@/components/admin/RoleGate'
import { supabaseBrowser } from '@/lib/supabase'

const EMPTY = {
  vin: '',
  plate: '',
  owner_name: '',
  phone: '',
  product_name: '',
  dealer: '',
  purchase_date: '',
  warranty_months: '24',
  status: 'active',
}

export default function Warranties() {
  const [rows, setRows] = useState<any[]>([])
  const [f, setF] = useState<any>(EMPTY)
  const [q, setQ] = useState('')
  const [error, setError] = useState('')

  const load = () =>
    supabaseBrowser()
      .from('vehicle_warranties')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => setRows(data || []))

  useEffect(() => {
    load()
  }, [])

  const add = async (e: any) => {
    e.preventDefault()
    setError('')
    if (!f.product_name || !f.purchase_date || (!f.vin && !f.plate)) {
      setError('Cần nhập tên xe, ngày mua và ít nhất VIN hoặc biển số.')
      return
    }
    const { error: dbError } = await supabaseBrowser()
      .from('vehicle_warranties')
      .insert({ ...f, warranty_months: Number(f.warranty_months) || 24 })
    if (dbError) {
      setError(dbError.message.includes('duplicate') ? 'VIN này đã tồn tại trong hệ thống.' : dbError.message)
      return
    }
    setF(EMPTY)
    load()
  }

  const remove = async (id: string) => {
    await supabaseBrowser().from('vehicle_warranties').delete().eq('id', id)
    load()
  }

  const filtered = q
    ? rows.filter((r) => `${r.vin || ''} ${r.plate || ''} ${r.owner_name || ''}`.toLowerCase().includes(q.toLowerCase()))
    : rows

  return (
    <RoleGate allow={['admin', 'editor']}>
      <div className="admin-page">
        <div className="page-head">
          <div>
            <span className="eyebrow">SAU BÁN HÀNG</span>
            <h1>Bảo hành xe</h1>
            <p>Dữ liệu này cấp nguồn cho công cụ tra cứu bảo hành công khai tại /warranty-check.</p>
          </div>
        </div>

        <form className="panel form-grid" onSubmit={add} style={{ marginBottom: 18 }}>
          <label>
            Số VIN
            <input value={f.vin} onChange={(e) => setF({ ...f, vin: e.target.value })} />
          </label>
          <label>
            Biển số
            <input value={f.plate} onChange={(e) => setF({ ...f, plate: e.target.value })} />
          </label>
          <label>
            Tên xe / model *
            <input value={f.product_name} onChange={(e) => setF({ ...f, product_name: e.target.value })} />
          </label>
          <label>
            Chủ xe
            <input value={f.owner_name} onChange={(e) => setF({ ...f, owner_name: e.target.value })} />
          </label>
          <label>
            Điện thoại
            <input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
          </label>
          <label>
            Đại lý bán
            <input value={f.dealer} onChange={(e) => setF({ ...f, dealer: e.target.value })} />
          </label>
          <label>
            Ngày mua *
            <input type="date" value={f.purchase_date} onChange={(e) => setF({ ...f, purchase_date: e.target.value })} />
          </label>
          <label>
            Số tháng bảo hành
            <input type="number" min={1} value={f.warranty_months} onChange={(e) => setF({ ...f, warranty_months: e.target.value })} />
          </label>
          <label>
            Trạng thái
            <select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}>
              <option value="active">Còn hiệu lực</option>
              <option value="void">Đã hủy</option>
            </select>
          </label>
          <button className="btn primary">+ Thêm bản ghi bảo hành</button>
          {error && <p style={{ color: '#c0392b', gridColumn: '1/-1' }}>{error}</p>}
        </form>

        <input className="field" placeholder="Tìm theo VIN / biển số / tên khách" value={q} onChange={(e) => setQ(e.target.value)} style={{ marginBottom: 14, maxWidth: 360 }} />

        <div className="content-page-list">
          {filtered.map((r) => (
            <div className="content-page-row" key={r.id}>
              <div>
                <b>
                  {r.product_name} · {r.vin || r.plate || '—'}
                </b>
                <small>
                  {r.owner_name || 'Chưa rõ chủ xe'} · {r.phone || '—'} · Mua ngày{' '}
                  {r.purchase_date ? new Date(r.purchase_date).toLocaleDateString('vi-VN') : '—'} · {r.warranty_months} tháng
                  {r.status === 'void' ? ' · ĐÃ HỦY' : ''}
                </small>
              </div>
              <button className="btn" onClick={() => remove(r.id)}>
                Xóa
              </button>
            </div>
          ))}
        </div>
      </div>
    </RoleGate>
  )
}
