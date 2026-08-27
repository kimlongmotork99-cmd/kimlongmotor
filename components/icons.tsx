// Bộ icon SVG dùng chung cho toàn site — không phụ thuộc thư viện ngoài để giữ bundle nhẹ.
type IconProps = { size?: number; className?: string }

const base = (size = 20) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
})

export function IconSearch({ size, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}

export function IconGlobe({ size, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.7-3.8-9s1.3-6.4 3.8-9Z" />
    </svg>
  )
}

export function IconChevronLeft({ size, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}

export function IconChevronRight({ size, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M9 18l6-6-6-6" />
    </svg>
  )
}

export function Icon360({ size, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <ellipse cx="12" cy="12" rx="10" ry="5.2" />
      <circle cx="12" cy="12" r="2.6" />
    </svg>
  )
}

export function IconCatalogue({ size, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M6 3h11a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
      <path d="M8 8h7M8 12h7M8 16h4" />
    </svg>
  )
}

export function IconPin({ size, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.4" />
    </svg>
  )
}

export function IconPlay({ size, className }: IconProps) {
  return (
    <svg {...base(size)} className={className} fill="currentColor" stroke="none">
      <path d="M8 5.14v13.72c0 .8.87 1.29 1.57.87l11.18-6.86a1 1 0 0 0 0-1.7L9.57 4.27A1 1 0 0 0 8 5.14Z" />
    </svg>
  )
}

export function IconFleet({ size, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <rect x="2" y="10" width="13" height="7" rx="1.4" />
      <path d="M15 12h3.2l2.8 3v2h-6z" />
      <circle cx="6" cy="18.5" r="1.6" />
      <circle cx="17.5" cy="18.5" r="1.6" />
    </svg>
  )
}

export function IconBusOutline({ size, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <rect x="3" y="4" width="18" height="12" rx="2.2" />
      <path d="M3 10h18M7 16v2M17 16v2" />
      <circle cx="7.5" cy="20" r="1.1" />
      <circle cx="16.5" cy="20" r="1.1" />
    </svg>
  )
}

export function IconTourism({ size, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M12 3v3M4.2 7.8l2.1 2.1M19.8 7.8l-2.1 2.1" />
      <circle cx="12" cy="14" r="7" />
      <path d="M12 10.5 13.6 13l2.5 1.6-2.5 1.6L12 18.7l-1.6-2.5L7.9 14.6l2.5-1.6z" />
    </svg>
  )
}

export function IconCorporate({ size, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M4 21V6.6c0-.6.4-1 .9-1.2l6.6-2.4c.6-.2 1.3.2 1.3.9V21" />
      <path d="M13 10.5l5.1 1.7c.5.2.9.7.9 1.2V21" />
      <path d="M8 8h.01M8 12h.01M8 16h.01M16 15h.01M16 18h.01" />
      <path d="M4 21h16" />
    </svg>
  )
}

export function IconWrench({ size, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M14.7 6.3a4 4 0 0 0-5.4 5l-6 6 2.4 2.4 6-6a4 4 0 0 0 5-5.4l-2.7 2.7-2-2Z" />
    </svg>
  )
}

export function IconCalendar({ size, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  )
}

export function IconShield({ size, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M12 3l7 3v5.5c0 4.6-3 7.8-7 9.5-4-1.7-7-4.9-7-9.5V6z" />
      <path d="m9.2 12 1.9 1.9L15 10" />
    </svg>
  )
}

export function IconPart({ size, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M14.7 6.3a4 4 0 0 0-5.4 5l-6 6 2.4 2.4 6-6a4 4 0 0 0 5-5.4l-2.7 2.7-2-2Z" />
      <circle cx="18" cy="6" r="2" />
    </svg>
  )
}

export function IconPhone({ size, className }: IconProps) {
  return (
    <svg {...base(size)} className={className} fill="currentColor" stroke="none">
      <path d="M6.6 10.8c1.4 2.7 3.6 4.9 6.3 6.3l2.1-2.1c.3-.3.7-.4 1.1-.2 1.1.4 2.4.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.6c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.2 1.1z" />
    </svg>
  )
}

export function IconFacebook({ size, className }: IconProps) {
  return (
    <svg {...base(size)} className={className} fill="currentColor" stroke="none">
      <path d="M13.5 21v-7.6h2.6l.4-3h-3v-1.9c0-.9.2-1.5 1.5-1.5h1.6V4.3c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.4H8v3h2.7V21z" />
    </svg>
  )
}

export function IconYoutube({ size, className }: IconProps) {
  return (
    <svg {...base(size)} className={className} fill="currentColor" stroke="none">
      <path d="M21.6 7.7a2.7 2.7 0 0 0-1.9-1.9C18 5.3 12 5.3 12 5.3s-6 0-7.7.5A2.7 2.7 0 0 0 2.4 7.7 28 28 0 0 0 2 12a28 28 0 0 0 .4 4.3 2.7 2.7 0 0 0 1.9 1.9c1.7.5 7.7.5 7.7.5s6 0 7.7-.5a2.7 2.7 0 0 0 1.9-1.9A28 28 0 0 0 22 12a28 28 0 0 0-.4-4.3ZM10 15V9l5.2 3z" />
    </svg>
  )
}

export function IconZalo({ size, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
      <path d="M7 15V9.2L12 15V9.2M15.2 15h2.3c1 0 1.6-.6 1.6-1.5s-.6-1.4-1.5-1.4h-.1c.8 0 1.3-.5 1.3-1.3 0-.8-.5-1.3-1.4-1.3h-2.2z" />
    </svg>
  )
}

export function IconLinkedin({ size, className }: IconProps) {
  return (
    <svg {...base(size)} className={className} fill="currentColor" stroke="none">
      <path d="M6.9 8.4H3.6V20h3.3zM5.3 3.6a1.9 1.9 0 1 0 0 3.9 1.9 1.9 0 0 0 0-3.9ZM20.4 20h-3.3v-6.2c0-1.5-.5-2.5-1.9-2.5-1 0-1.6.7-1.9 1.4-.1.2-.1.6-.1.9V20h-3.3s.1-10.4 0-11.6h3.3v1.6c.4-.7 1.2-1.7 3-1.7 2.2 0 3.9 1.4 3.9 4.5z" />
    </svg>
  )
}
