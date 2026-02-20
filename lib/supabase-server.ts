import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'

// Use in Server Components and API routes that need to respect user auth
export function createServerClient() {
  const cookieStore = cookies()
  return createServerComponentClient({ cookies: () => cookieStore })
}

// Use in API routes that need admin/service-role access (bypasses RLS)
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
