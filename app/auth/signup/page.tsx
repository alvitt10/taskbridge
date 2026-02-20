'use client'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

function SignupForm() {
  const searchParams = useSearchParams()
  const initialRole = searchParams.get('role') || 'customer'
  const [form, setForm] = useState({ name: '', email: '', password: '', role: initialRole })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.name, role: form.role },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) { setError(error.message); setLoading(false); return }
    if (data.session) {
      router.push(form.role === 'provider' ? '/provider/dashboard' : '/dashboard')
    } else { setSuccess(true) }
  }

  if (success) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ background: 'white', borderRadius: 24, padding: 48, maxWidth: 440, width: '100%', textAlign: 'center', boxShadow: '0 8px 48px rgba(0,0,0,.08)' }}>
          <div style={{ fontSize: 56, marginBottom: 20 }}>📧</div>
          <h2 style={{ fontFamily: 'Syne', fontSize: 26, fontWeight: 800, color: 'var(--ink)', marginBottom: 12 }}>Check your email</h2>
          <p style={{ color: 'var(--muted)', fontSize: 15 }}>We sent a confirmation link to <strong>{form.email}</strong>. Click it to activate your account.</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: 'white', borderRadius: 24, padding: 48, maxWidth: 480, width: '100%', boxShadow: '0 8px 48px rgba(0,0,0,.08)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 32 }}>
          <div style={{ width: 8, height: 8, background: 'var(--accent)', borderRadius: '50%' }} />
          <span style={{ fontFamily: 'Syne', fontSize: 18, fontWeight: 800, color: 'var(--ink)' }}>TaskBridge</span>
        </Link>
        <h1 style={{ fontFamily: 'Syne', fontSize: 28, fontWeight: 800, color: 'var(--ink)', marginBottom: 8 }}>Create account</h1>
        <p style={{ color: 'var(--muted)', fontSize: 15, marginBottom: 28 }}>Free forever. No credit card required.</p>
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--muted)', marginBottom: 10 }}>I am a...</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[{ value: 'customer', icon: '🏠', name: 'Customer', desc: 'I need services' }, { value: 'provider', icon: '🔧', name: 'Provider', desc: 'I offer services' }].map(r => (
              <button key={r.value} type="button" onClick={() => setForm(f => ({ ...f, role: r.value }))}
                style={{ padding: 16, border: `1.5px solid ${form.role === r.value ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 12, cursor: 'pointer', textAlign: 'center', background: form.role === r.value ? 'var(--accent-light)' : 'white', transition: 'all .2s' }}>
                <div style={{ fontSize: 24, marginBottom: 4 }}>{r.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{r.name}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{r.desc}</div>
              </button>
            ))}
          </div>
        </div>
        <form onSubmit={handleSignup}>
          <FormGroup label="Full name"><input type="text" required style={inputStyle} placeholder="Your full name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></FormGroup>
          <FormGroup label="Email address"><input type="email" required style={inputStyle} placeholder="you@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></FormGroup>
          <FormGroup label="Password"><input type="password" required minLength={8} style={inputStyle} placeholder="Min. 8 characters" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} /></FormGroup>
          {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 16px', fontSize: 14, color: '#dc2626', marginBottom: 16 }}>{error}</div>}
          <button type="submit" disabled={loading} style={{ width: '100%', padding: 16, background: 'var(--ink)', color: 'white', border: 'none', borderRadius: 999, fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 8 }}>
            {loading ? 'Creating account...' : 'Create account →'}
          </button>
        </form>
        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--muted)', marginTop: 16 }}>By signing up you agree to our <a href="#" style={{ color: 'var(--accent)' }}>Terms</a> and <a href="#" style={{ color: 'var(--accent)' }}>Privacy Policy</a>.</p>
        <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--muted)', marginTop: 16 }}>Already have an account? <Link href="/auth/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in</Link></p>
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

export default function SignupPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>}>
      <SignupForm />
    </Suspense>
  )
}
