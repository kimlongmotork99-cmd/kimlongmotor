/**
 * Rate limiter đơn giản dùng bộ nhớ (in-memory) theo IP.
 * Lưu ý: chỉ hiệu quả trên 1 instance server. Nếu triển khai serverless nhiều instance
 * hoặc cần chống spam nghiêm ngặt hơn, nên thay bằng Upstash Redis / Vercel KV.
 */
const hits = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(key: string, limit = 5, windowMs = 60_000): { ok: boolean; remaining: number } {
  const now = Date.now()
  const entry = hits.get(key)

  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, remaining: limit - 1 }
  }

  entry.count += 1
  if (entry.count > limit) return { ok: false, remaining: 0 }
  return { ok: true, remaining: limit - entry.count }
}

// Dọn bộ nhớ định kỳ để không phình to
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of hits) {
    if (now > entry.resetAt) hits.delete(key)
  }
}, 5 * 60_000)
