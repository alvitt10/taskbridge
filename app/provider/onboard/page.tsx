'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Nav from '@/components/Nav'
import { supabase } from '@/lib/supabase'

const CATEGORIES = ['Plumbing', 'Electrical', 'Cleaning', 'Landscaping', 'Painting', 'Moving', 'HVAC', 'Carpentry', 'Handyman', 'Roofing']

export default function ProviderOnboard() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    category: '',
    bio: '',
    pricePerHour: 60,
    address: '',
    city: '',
    yearsExperience: 0,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit() {
    setLoading(true)
    setError('')
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/auth/login'); return }

    // Geocode the address using Google Maps API (simplified — uses default coords)
    // In production, call Google Maps Geocoding API
    const lat = 43.6532 + (Math.random() - 0.5) * 0.1
    const lng = -79.3832 + (Math.random() - 0.5) * 0.1

    const { error } = await supabase.from('service_providers').insert({
      user_id: session.user.id,
      category: form.category,
      bio: form.bio,
      price_per_hour: form.pricePerHour,
      address: form.address,
      city: form.city,
      years_experience: form.yearsExperience,
      // PostGIS point — stored via Supabase
      location: `POINT(${lng} ${lat})`,
    })

    if (error) { setError(error.message); setLoading(false); return }
    router.push('/provider/dashboard')
  }

  return (
    <>
      <Nav />
      <main style={{ paddingTop: 68, background: 'var(--paper)', minHeight: '100vh' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '60px 24px' }}>
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
              {[1, 2, 3].map(s => (
                <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: step >= s ? 'var(--accent)' : 'var(--border)', transition: 'background .3s' }} />
              ))}
            </div>
            <h1 style={{ fontFamily: 'Syne', fontSize: 32, fontWeight: 800, color: 'var(--ink)', marginBottom: 8 }}>
              {step === 1 ? 'Your service' : step === 2 ? 'About you' : 'Your location'}
            </h1>
            <p style={{ color: 'var(--muted)' }}>Step {step} of 3 — Takes about 3 minutes</p>
          </div>

          <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 20, padding: 40 }}>
            {step === 1 && (
              <>
                <FormGroup label="Service Category *">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                    {CATEGORIES.map(c => (
                      <button key={c} type="button" onClick={() => setForm(f => ({ ...f, category: c }))}
                        style={{ padding: '12px', border: `1.5px solid ${form.category === c ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 10, cursor: 'pointer', background: form.category === c ? 'var(--accent-light)' : 'white', fontWeight: form.category === c ? 600 : 400, color: form.category === c ? 'var(--accent)' : 'var(--text)', fontSize: 14 }}>
                        {c}
                      </button>
                    ))}
                  </div>
                </FormGroup>
                <FormGroup label="Hourly Rate (CAD $)">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <input type="range" min={25} max={250} step={5} value={form.pricePerHour}
                      onChange={e => setForm(f => ({ ...f, pricePerHour: Number(e.target.value) }))}
                      style={{ flex: 1, accentColor: 'var(--accent)' }} />
                    <span style={{ fontFamily: 'Syne', fontSize: 24, fontWeight: 800, minWidth: 80 }}>${form.pricePerHour}</span>
                  </div>
                </FormGroup>
              </>
            )}

            {step === 2 && (
              <>
                <FormGroup label="Bio — Tell customers about yourself *">
                  <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 120 }}
                    placeholder="Describe your experience, specialties, and what makes you stand out..."
                    value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} />
                </FormGroup>
                <FormGroup label="Years of Experience">
                  <input type="number" min={0} max={50} style={inputStyle} value={form.yearsExperience}
                    onChange={e => setForm(f => ({ ...f, yearsExperience: Number(e.target.value) }))} />
                </FormGroup>
              </>
            )}

            {step === 3 && (
              <>
                <FormGroup label="Street Address *">
                  <input type="text" style={inputStyle} placeholder="123 Main Street"
                    value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
                </FormGroup>
                <FormGroup label="City *">
                  <input type="text" style={inputStyle} placeholder="Toronto"
                    value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
                </FormGroup>
                <div style={{ background: 'var(--accent-light)', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: 'var(--accent2)', marginBottom: 16 }}>
                  📍 Your exact address is never shown to customers — only your neighbourhood is displayed.
                </div>
              </>
            )}

            {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 16px', fontSize: 14, color: '#dc2626', marginBottom: 16 }}>{error}</div>}

            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              {step > 1 && (
                <button onClick={() => setStep(s => s - 1)} style={{ flex: 1, padding: 14, background: 'transparent', border: '1px solid var(--border)', borderRadius: 999, cursor: 'pointer', fontSize: 14 }}>← Back</button>
              )}
              {step < 3 ? (
                <button onClick={() => setStep(s => s + 1)} disabled={step === 1 && !form.category}
                  style={{ flex: 2, padding: 14, background: 'var(--ink)', color: 'white', border: 'none', borderRadius: 999, cursor: 'pointer', fontSize: 15, fontWeight: 600 }}>
                  Continue →
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={loading || !form.address || !form.city}
                  style={{ flex: 2, padding: 14, background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 999, cursor: 'pointer', fontSize: 15, fontWeight: 600 }}>
                  {loading ? 'Creating your profile...' : 'Launch my profile 🚀'}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

function FormGroup({ label, children }: { label: string, children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--muted)', marginBottom: 8 }}>{label}</label>
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
