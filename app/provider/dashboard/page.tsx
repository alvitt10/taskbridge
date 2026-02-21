'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Nav from '@/components/Nav'
import { supabase } from '@/lib/supabase'

export default function ProviderDashboard() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/auth/login?redirect=/provider/dashboard'); return }

      const { data: userData } = await supabase
        .from('users').select('*').eq('id', session.user.id).single()
      if (userData?.role !== 'provider') { router.push('/dashboard'); return }
      setUser(userData)

      const { data: providerProfile } = await supabase
        .from('service_providers').select('*').eq('user_id', session.user.id).single()
      setProfile(providerProfile)

      if (providerProfile) {
        const { data: bookingData } = await supabase
          .from('bookings')
          .select('*, users!customer_id(full_name, email)')
          .eq('provider_id', providerProfile.id)
          .order('date', { ascending: true })
        setBookings(bookingData || [])
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <>
      <Nav />
      <div style={{ paddingTop: 68, minHeight: '100vh', background: 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--muted)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    </>
  )

  // No provider profile yet — show onboarding prompt
  if (!profile) return (
    <>
      <Nav />
      <main style={{ paddingTop: 68, minHeight: '100vh', background: 'var(--paper)' }}>
        <div style={{ maxWidth: 600, margin: '80px auto', padding: '0 48px' }}>
          <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 20, padding: 48, textAlign: 'center' }}>
            <div style={{ fontSize: 56, marginBottom: 20 }}>🔧</div>
            <h2 style={{ fontFamily: 'Syne', fontSize: 28, fontWeight: 800, color: 'var(--ink)', marginBottom: 12 }}>Complete your profile</h2>
            <p style={{ color: 'var(--muted)', fontSize: 15, marginBottom: 28 }}>Set up your provider profile to start receiving booking requests.</p>
            <a href="/provider/onboard" style={{ display: 'inline-block', padding: '14px 32px', background: 'var(--accent)', color: 'white', borderRadius: 999, fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>
              Set up my profile →
            </a>
          </div>
        </div>
      </main>
    </>
  )

  const now = new Date().toISOString().split('T')[0]
  const upcoming = bookings.filter(b => ['confirmed', 'pending_payment'].includes(b.status) && b.date >= now)
  const totalEarnings = bookings.filter(b => b.status === 'completed').reduce((s, b) => s + b.total_amount, 0)
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
  const monthEarnings = bookings.filter(b => b.status === 'completed' && b.created_at >= startOfMonth).reduce((s, b) => s + b.total_amount, 0)

  return (
    <>
      <Nav />
      <main style={{ paddingTop: 68, background: 'var(--paper)', minHeight: '100vh' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 48px' }}>
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontFamily: 'Syne', fontSize: 32, fontWeight: 800, color: 'var(--ink)' }}>Dashboard</h1>
            <p style={{ color: 'var(--muted)', marginTop: 4 }}>Welcome back, {user?.full_name?.split(' ')[0]}</p>
          </div>

          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
            {[
              { label: 'Monthly Earnings', val: `$${(monthEarnings / 100).toFixed(0)}`, sub: 'This month' },
              { label: 'Total Bookings',   val: bookings.length,                         sub: 'All time' },
              { label: 'Avg. Rating',      val: `${profile.avg_rating || 0}★`,           sub: `${profile.total_reviews || 0} reviews` },
              { label: 'Upcoming Jobs',    val: upcoming.length,                          sub: 'Confirmed' },
            ].map(k => (
              <div key={k.label} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
                <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--muted)', marginBottom: 8 }}>{k.label}</div>
                <div style={{ fontFamily: 'Syne', fontSize: 36, fontWeight: 800, color: 'var(--ink)' }}>{k.val}</div>
                <div style={{ fontSize: 12, color: 'var(--accent)', marginTop: 4 }}>{k.sub}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
            {/* Upcoming bookings */}
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
              <h2 style={{ fontFamily: 'Syne', fontSize: 20, fontWeight: 700, color: 'var(--ink)', marginBottom: 20 }}>Upcoming Bookings</h2>
              {upcoming.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted)' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                  <p>No upcoming bookings yet. Your profile is live!</p>
                </div>
              ) : upcoming.map(b => {
                const customer = b.users
                return (
                  <div key={b.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--paper2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>👤</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)', marginBottom: 2 }}>
                        {customer?.full_name} — {b.service_type}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>📅 {b.date} · {b.time_slot}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>📍 {b.address}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                      <span style={{ fontFamily: 'Syne', fontSize: 16, fontWeight: 700 }}>${(b.total_amount / 100).toFixed(0)}</span>
                      <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: b.status === 'confirmed' ? '#d1fae5' : '#fef3c7', color: b.status === 'confirmed' ? '#065f46' : '#92400e' }}>
                        {b.status}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
                <h3 style={{ fontFamily: 'Syne', fontSize: 16, fontWeight: 700, color: 'var(--ink)', marginBottom: 16 }}>Profile Status</h3>
                {[
                  { label: 'Profile visible', val: profile.is_active ? 'Active' : 'Hidden', ok: profile.is_active },
                  { label: 'Verified status', val: profile.is_verified ? 'Verified ✓' : 'Pending', ok: profile.is_verified },
                  { label: 'Total reviews',   val: String(profile.total_reviews || 0), ok: true },
                  { label: 'Avg. rating',     val: `${profile.avg_rating || 0}/5.0`, ok: (profile.avg_rating || 0) >= 4 },
                ].map(s => (
                  <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--muted)' }}>{s.label}</span>
                    <span style={{ fontWeight: 600, color: s.ok ? 'var(--accent)' : 'var(--warm)' }}>{s.val}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
                <h3 style={{ fontFamily: 'Syne', fontSize: 16, fontWeight: 700, color: 'var(--ink)', marginBottom: 12 }}>Total Earnings</h3>
                <div style={{ fontFamily: 'Syne', fontSize: 32, fontWeight: 800, color: 'var(--ink)' }}>${(totalEarnings / 100).toFixed(0)}</div>
                <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>All time</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
