import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that require authentication
const PROTECTED_ROUTES = ['/dashboard', '/provider', '/book', '/bookings']
// Routes that should redirect logged-in users away (login/signup)
const AUTH_ROUTES = ['/auth/login', '/auth/signup']

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const { data: { session } } = await supabase.auth.getSession()

  const path = req.nextUrl.pathname

  // Redirect unauthenticated users away from protected routes
  if (!session && PROTECTED_ROUTES.some(r => path.startsWith(r))) {
    const redirectUrl = new URL('/auth/login', req.url)
    redirectUrl.searchParams.set('redirect', path)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect logged-in users away from auth pages
  if (session && AUTH_ROUTES.includes(path)) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/payments/webhook).*)'],
}
