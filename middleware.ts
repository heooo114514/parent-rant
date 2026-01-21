import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import appConfig from './parent-rant.config.json'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  let validUrl = 'https://example.supabase.co'
  try {
    if (url && url.startsWith('http')) {
      new URL(url)
      validUrl = url
    }
  } catch (e) {
    // Invalid URL, use fallback
  }
  const validKey = key || 'example-key'

  const supabase = createServerClient(
    validUrl,
    validKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const bypassCookie = request.cookies.get('admin_bypass_session')
  const isBypassAuth = bypassCookie?.value === 'true'

  // Admin route protection
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Define admin whitelist from config
    const ADMIN_WHITELIST = appConfig.security.adminEmails

    // Allow access to login page
    if (request.nextUrl.pathname === '/admin/login') {
      if ((user && user.email && ADMIN_WHITELIST.includes(user.email)) || isBypassAuth) {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
      return response
    }

    // Protect dashboard and all other admin routes
    if (!user && !isBypassAuth) {
      // Force redirect to admin login if no session
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    // Check if user is in whitelist (if logged in via Supabase)
    if (user && user.email && !ADMIN_WHITELIST.includes(user.email)) {
      // User is logged in but not an admin -> Redirect to home
      return NextResponse.redirect(new URL('/', request.url))
    }
    
    // If bypassing, we assume they are admin because they knew the password
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
