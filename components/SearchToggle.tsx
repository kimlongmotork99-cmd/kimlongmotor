'use client'
import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { IconSearch, IconGlobe } from './icons'
import type { Suggestion } from '@/lib/search'

export default function SearchToggle() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [activeIndex, setActiveIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  // Gợi ý theo thời gian thực, debounce 200ms để tránh gọi API dồn dập khi gõ nhanh.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setActiveIndex(-1)

    if (query.trim().length < 2) {
      setSuggestions([])
      return
    }

    debounceRef.current = setTimeout(async () => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller
      try {
        const res = await fetch(`/api/search/suggest?q=${encodeURIComponent(query.trim())}`, {
          signal: controller.signal,
        })
        if (!res.ok) return
        const data = await res.json()
        setSuggestions(data.suggestions || [])
      } catch {
        // Bỏ qua lỗi mạng / request bị hủy — không làm gián đoạn gõ phím của người dùng.
      }
    }, 200)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  const goToResults = (q: string) => {
    if (!q.trim()) return
    router.push(`/search?q=${encodeURIComponent(q.trim())}`)
    close()
  }

  const goToSuggestion = (s: Suggestion) => {
    router.push(s.type === 'product' ? `/products/${s.slug}` : `/news/${s.slug}`)
    close()
  }

  const close = () => {
    setOpen(false)
    setQuery('')
    setSuggestions([])
    setActiveIndex(-1)
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      goToSuggestion(suggestions[activeIndex])
    } else {
      goToResults(query)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' && suggestions.length) {
      e.preventDefault()
      setActiveIndex((i) => (i + 1) % suggestions.length)
    } else if (e.key === 'ArrowUp' && suggestions.length) {
      e.preventDefault()
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1))
    } else if (e.key === 'Escape') {
      close()
    }
  }

  return (
    <div className="nav-tools">
      <button type="button" className="nav-lang" aria-label="Ngôn ngữ">
        <IconGlobe size={16} />
        <span>VI</span>
      </button>

      <form className={`nav-search${open ? ' open' : ''}`} onSubmit={submit} role="search">
        {open && (
          <div className="nav-search-wrap" style={{ position: 'relative' }}>
            <input
              ref={inputRef}
              type="text"
              value={query}
              placeholder="Tìm kiếm sản phẩm, tin tức…"
              autoComplete="off"
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              onBlur={() => setTimeout(close, 150)}
            />
            {suggestions.length > 0 && (
              <ul
                className="nav-search-suggest"
                role="listbox"
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: '#fff',
                  boxShadow: '0 8px 24px rgba(0,0,0,.12)',
                  borderRadius: 6,
                  marginTop: 6,
                  overflow: 'hidden',
                  zIndex: 40,
                  listStyle: 'none',
                  padding: 0,
                }}
              >
                {suggestions.map((s, i) => (
                  <li
                    key={`${s.type}-${s.slug}`}
                    role="option"
                    aria-selected={i === activeIndex}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => goToSuggestion(s)}
                    style={{
                      padding: '10px 14px',
                      cursor: 'pointer',
                      background: i === activeIndex ? 'rgba(0,0,0,.05)' : 'transparent',
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 12,
                      fontSize: 14,
                    }}
                  >
                    <span>{s.title}</span>
                    <span className="muted" style={{ fontSize: 11, whiteSpace: 'nowrap' }}>
                      {s.type === 'product' ? s.category || 'Sản phẩm' : 'Tin tức'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        <button type={open ? 'submit' : 'button'} aria-label="Tìm kiếm" onClick={() => !open && setOpen(true)} onMouseDown={(e) => open && e.preventDefault()}>
          <IconSearch size={17} />
        </button>
      </form>
    </div>
  )
}
