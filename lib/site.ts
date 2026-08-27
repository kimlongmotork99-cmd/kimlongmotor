export const siteConfig = {
  url: (process.env.NEXT_PUBLIC_SITE_URL || 'https://kimlongmotor.vn').replace(/\/$/, ''),
  name: 'KIM LONG MOTOR',
  defaultTitle: 'KIM LONG MOTOR | Ô tô thương mại Việt Nam',
  defaultDescription:
    'KIM LONG MOTOR – nhà sản xuất xe bus, city bus, minibus và xe thương mại tại Việt Nam. Giải pháp vận tải toàn diện, an toàn và bền vững.',
  locale: 'vi_VN',
}

/** Cắt mô tả về độ dài an toàn cho thẻ meta description (khoảng 155-160 ký tự). */
export function toMetaDescription(text?: string | null, fallback = siteConfig.defaultDescription) {
  const clean = (text || '').replace(/\s+/g, ' ').trim()
  if (!clean) return fallback
  return clean.length > 160 ? `${clean.slice(0, 157)}...` : clean
}

/** Chuyển URL ảnh tương đối/tuyệt đối thành URL tuyệt đối để dùng cho Open Graph. */
export function toAbsoluteUrl(path?: string | null, fallback = '/assets/hero.jpg') {
  const value = path || fallback
  if (/^https?:\/\//i.test(value)) return value
  return `${siteConfig.url}${value.startsWith('/') ? '' : '/'}${value}`
}
