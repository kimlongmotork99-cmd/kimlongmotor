'use client'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabaseBrowser } from '@/lib/supabase'
import { IconPin } from './icons'

type Location = {
  id: string
  name: string
  region: string | null
  address: string | null
  type: 'Showroom' | 'Trạm dịch vụ'
}

// Cố gắng tách "quận/huyện" từ chuỗi địa chỉ tự do, vì bảng dealers/service_centers
// hiện chỉ lưu 1 trường "region" (tỉnh/thành) chứ chưa có cột quận/huyện riêng.
// Địa chỉ thường theo format: "..., Phường/Xã, Quận/Huyện, Tỉnh/Thành phố"
function extractDistrict(address: string | null): string | null {
  if (!address) return null
  const parts = address.split(',').map((p) => p.trim()).filter(Boolean)
  const hit = parts.find((p) => /quận|huyện|thị xã|tp\.?\s/i.test(p))
  return hit || null
}

export default function ShowroomFinder() {
  const router = useRouter()
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [region, setRegion] = useState('')
  const [district, setDistrict] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      const sb = supabaseBrowser()
      const [{ data: dealers }, { data: centers }] = await Promise.all([
        sb.from('dealers').select('id,name,region,address').eq('status', 'active'),
        sb.from('service_centers').select('id,name,region,address').eq('status', 'active'),
      ])
      if (cancelled) return
      const combined: Location[] = [
        ...(dealers || []).map((d: any) => ({ ...d, type: 'Showroom' as const })),
        ...(centers || []).map((c: any) => ({ ...c, type: 'Trạm dịch vụ' as const })),
      ]
      setLocations(combined)
      setLoading(false)
    }
    load().catch(() => setLoading(false))
    return () => {
      cancelled = true
    }
  }, [])

  const regions = useMemo(
    () => Array.from(new Set(locations.map((l) => l.region).filter(Boolean))).sort() as string[],
    [locations]
  )

  const districts = useMemo(() => {
    if (!region) return []
    const set = new Set(
      locations
        .filter((l) => l.region === region)
        .map((l) => extractDistrict(l.address))
        .filter(Boolean) as string[]
    )
    return Array.from(set).sort()
  }, [locations, region])

  const totalCount = locations.length

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (region) params.set('region', region)
    if (district) params.set('district', district)
    router.push(`/showroom${params.toString() ? `?${params.toString()}` : ''}`)
  }

  return (
    <section className="showroom-section">
      <div className="showroom-grid">
        <div className="showroom-map-col">
          <Image
            src="/assets/vietnam-map.jpg"
            alt="Bản đồ hệ thống showroom KIM LONG MOTOR trên toàn quốc"
            fill
            sizes="(max-width: 900px) 100vw, 25vw"
            style={{ objectFit: 'contain', objectPosition: 'center' }}
            loading="lazy"
          />
        </div>

        <div className="showroom-panel">
          <h2>TÌM SHOWROOM GẦN BẠN</h2>

          <div className="showroom-form-row">
            <select
              className="field showroom-select"
              value={region}
              onChange={(e) => {
                setRegion(e.target.value)
                setDistrict('')
              }}
            >
              <option value="">Chọn tỉnh / thành phố</option>
              {regions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>

            <select
              className="field showroom-select"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              disabled={!region || districts.length === 0}
            >
              <option value="">Chọn quận / huyện</option>
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <button type="button" className="showroom-search-btn" onClick={handleSearch}>
              TÌM KIẾM
            </button>
          </div>

          <div className="showroom-meta">
            <IconPin size={18} />
            <span>
              Hệ thống {loading ? '...' : `hơn ${Math.max(totalCount, 1)}`} showroom &amp; trạm dịch vụ trên toàn
              quốc
            </span>
          </div>

          <a href="/showroom" className="btn" style={{ width: 'fit-content' }}>
            XEM TẤT CẢ SHOWROOM →
          </a>
        </div>

        <div className="showroom-photo-col">
          <Image
            src="/assets/showroom-building.jpg"
            alt="Showroom KIM LONG MOTOR"
            fill
            sizes="(max-width: 900px) 100vw, 35vw"
            style={{ objectFit: 'contain' }}
            loading="lazy"
          />
        </div>
      </div>
    </section>
  )
}
