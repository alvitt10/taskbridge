'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { User } from '@/types'

export default function Nav() {
  const [user, setUser] = useState<User | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) fetchUser(session.user.id)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) fetchUser(session.user.id)
      else setUser(null)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function fetchUser(id: string) {
    const { data } = await supabase.from('users').select('*').eq('id', id).single()
    if (data) setUser(data)
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  const dashLink = user?.role === 'provider' ? '/provider/dashboard' : '/dashboard'

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 48px', height: '68px',
      background: 'rgba(247,245,240,0.92)',
      backdropFilter: 'blur(24px) saturate(180%)',
      borderBottom: '1px solid var(--border)',
    }}>
      {/* Logo */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
        <div style={{ width: 8, height: 8, background: 'var(--accent)', borderRadius: '50%' }} />
        <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 21, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-.02em' }}>
          TaskBridge
        </span>
      </Link>

      {/* Desktop Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <Link href="/search" style={linkStyle}>Search</Link>
        <Link href="/chat" style={linkStyle}>AI Discovery</Link>
        {!user && <Link href="/auth/signup?role=provider" style={linkStyle}>Join as Pro</Link>}

        {user ? (
          <>
            <Link href={dashLink} style={linkStyle}>Dashboard</Link>
            <button onClick={signOut} style={{ ...linkStyle, border: 'none', background: 'none', cursor: 'pointer' }}>
              Sign out
            </button>
            <Link href={dashLink} style={ctaStyle}>
              {user.full_name.split(' ')[0]} ↗
            </Link>
          </>
        ) : (
          <>
            <Link href="/auth/login" style={linkStyle}>Log in</Link>
            <Link href="/auth/signup" style={ctaStyle}>Get started</Link>
          </>
        )}
      </div>
    </nav>
  )
}

const linkStyle: React.CSSProperties = {
  padding: '8px 16px', borderRadius: '999px',
  fontSize: 14, fontWeight: 500, color: 'var(--muted)',
  textDecoration: 'none', transition: 'all .2s',
}

const ctaStyle: React.CSSProperties = {
  padding: '10px 22px', borderRadius: '999px',
  background: 'var(--ink)', color: 'var(--paper)',
  fontSize: 14, fontWeight: 600,
  textDecoration: 'none', transition: 'all .2s',
  marginLeft: '8px',
}
