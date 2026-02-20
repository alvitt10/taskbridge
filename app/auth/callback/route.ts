import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    await supabase.auth.exchangeCodeForSession(code)

    // Get user role to redirect to correct dashboard
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      const { data: user } = await supabase
        .from('users').select('role').eq('id', session.user.id).single()
      
      const redirectTo = user?.role === 'provider' ? '/provider/dashboard' : '/dashboard'
      return NextResponse.redirect(new URL(redirectTo, requestUrl.origin))
    }
  }

  return NextResponse.redirect(new URL('/auth/login', requestUrl.origin))
}
