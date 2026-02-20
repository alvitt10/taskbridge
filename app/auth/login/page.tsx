'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Get role to redirect correctly
    const { data: user } = await supabase
      .from('users').select('role').eq('id', data.user.id).single()
    
    router.push(user?.role === 'provider' ? '/provider/dashboard' : redirect)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: 'white', borderRadius: 24, padding: '48px', maxWidth: 440, width: '100%', boxShadow: '0 8px 48px rgba(0,0,0,.08)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 32 }}>
          <div style={{ width: 8, height: 8, background: 'var(--accent)', borderRadius: '50%' }} />
          <span style={{ fontFamily: 'Syne', fontSize: 18, fontWeight: 800, color: 'var(--ink)' }}>TaskBridge</span>
        </Link>

        <h1 style={{ fontFamily: 'Syne', fontSize: 28, fontWeight: 800, color: 'var(--ink)', marginBottom: 8 }}>Welcome back</h1>
        <p style={{ color: 'var(--muted)', fontSize: 15, marginBottom: 32 }}>Sign in to your account</p>

        <form onSubmit={handleLogin}>
          <FormGroup label="Email address">
            <input type="email" required style={inputStyle} placeholder="you@email.com"
              value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </FormGroup>

          <FormGroup label="Password">
            <input type="password" required style={inputStyle} placeholder="Your password"
              value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
          </FormGroup>

          <div style={{ textAlign: 'right', marginBottom: 24 }}>
            <Link href="/auth/reset" style={{ fontSize: 13, color: 'var(--accent)' }}>Forgot password?</Link>
          </div>

          {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 16px', fontSize: 14, color: '#dc2626', marginBottom: 16 }}>{error}</div>}

          <button type="submit" disabled={loading} style={{ width: '100%', padding: 16, background: 'var(--ink)', color: 'white', border: 'none', borderRadius: 999, fontSize: 15, fontWeight: 600, cursor: 'pointer', transition: 'all .2s' }}>
            {loading ? 'Signing in...' : 'Sign in →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--muted)', marginTop: 24 }}>
          Don't have an account? <Link href="/auth/signup" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign up free</Link>
        </p>
      </div>
    </div>
  )
}

function FormGroup({ label, children }: { label: string, children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--muted)', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '13px 16px',
  background: 'var(--paper)', border: '1.5px solid var(--border)',
  borderRadius: 10, fontFamily: 'Instrument Sans, sans-serif',
  fontSize: 15, color: 'var(--text)', outline: 'none',
}
