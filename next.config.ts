import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    // Ảnh CMS được lưu trên Supabase Storage -> cho phép next/image tối ưu (resize, WebP/AVIF, lazy-load)
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/v1/object/public/**' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
}

export default nextConfig
