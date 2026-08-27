import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { roleCan, type Role } from '@/lib/admin'

// Các mục chỉ Admin được truy cập nhưng chưa có trong roleCan (bổ sung ở CMS V3.2)
const ADMIN_ONLY_SECTIONS = ['users', 'settings', 'dealers', 'services', 'content']

function sectionFromPath(pathname: string): string {
  const segment = pathname.split('/')[2]
  return segment || 'dashboard'
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next({ request: req })

  const sb = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value)
            res.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await sb.auth.getUser()

  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')
  const isLoginRoute = req.nextUrl.pathname === '/login'

  if (isAdminRoute && !user) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (isLoginRoute && user) {
    return NextResponse.redirect(new URL('/admin', req.url))
  }

  // Kiểm tra phân quyền theo role ngay ở middleware - lớp bảo vệ bổ sung
  // bên cạnh RLS ở database, tránh flash-of-unauthorized-content phía client.
  if (isAdminRoute && user) {
    const { data: profile } = await sb.from('user_profiles').select('role').eq('id', user.id).single()
    const role = (profile?.role as Role) || null
    const section = sectionFromPath(req.nextUrl.pathname)

    const allowed = role === 'admin' || (role && roleCan[role]?.includes(section as any) && !ADMIN_ONLY_SECTIONS.includes(section))

    if (!allowed && section !== 'dashboard') {
      return NextResponse.redirect(new URL('/admin', req.url))
    }
  }

  return res
}

export const config = { matcher: ['/admin/:path*', '/login'] }
