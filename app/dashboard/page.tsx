import { createServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Nav from '@/components/Nav'

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  pending_payment: { bg: '#fef3c7', color: '#92400e' },
  confirmed: { bg: '#d1fae5', color: '#065f46' },
  in_progress: { bg: '#dbeafe', color: '#1e40af' },
  completed: { bg: '#f3f4f6', color: '#374151' },
  cancelled: { bg: '#fee2e2', color: '#991b1b' },
}

export default async function CustomerDashboard() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/auth/login?redirect=/dashboard')

  const { data: user } = await supabase.from('users').select('*').eq('id', session.user.id).single()
  if (user?.role === 'provider') redirect('/provider/dashboard')

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, service_providers!inner(*, users!inner(full_name))')
    .eq('customer_id', session.user.id)
    .order('created_at', { ascending: false })

  const upcoming = (bookings || []).filter((b: any) => ['confirmed', 'pending_payment', 'in_progress'].includes(b.status))
  const past = (bookings || []).filter((b: any) => ['completed', 'cancelled'].includes(b.status))
  const totalSpent = (bookings || []).filter((b: any) => b.status === 'completed').reduce((s: number, b: any) => s + b.total_amount, 0)

  return (
    <>
      <Nav />
      <main style={{ paddingTop: 68, background: 'var(--paper)', minHeight: '100vh' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 48px' }}>
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontFamily: 'Syne', fontSize: 32, fontWeight: 800, color: 'var(--ink)' }}>Welcome back, {user?.full_name?.split(' ')[0]}!</h1>
            <p style={{ color: 'var(--muted)', marginTop: 4 }}>Here's an overview of your bookings</p>
          </div>

          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
            {[
              { label: 'Total Bookings', val: bookings?.length || 0 },
              { label: 'Upcoming', val: upcoming.length },
              { label: 'Completed', val: past.filter((b: any) => b.status === 'completed').length },
              { label: 'Total Spent', val: `$${(totalSpent / 100).toFixed(0)}` },
            ].map(k => (
              <div key={k.label} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
                <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--muted)', marginBottom: 8 }}>{k.label}</div>
                <div style={{ fontFamily: 'Syne', fontSize: 36, fontWeight: 800, color: 'var(--ink)' }}>{k.val}</div>
              </div>
            ))}
          </div>

          {/* Upcoming Bookings */}
          <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 16, padding: 24, marginBottom: 24 }}>
            <h2 style={{ fontFamily: 'Syne', fontSize: 20, fontWeight: 700, color: 'var(--ink)', marginBottom: 20 }}>Upcoming Bookings</h2>
            {upcoming.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted)' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📅</div>
                <p>No upcoming bookings. <a href="/search" style={{ color: 'var(--accent)' }}>Find a provider →</a></p>
              </div>
            ) : upcoming.map((b: any) => (
              <BookingRow key={b.id} booking={b} />
            ))}
          </div>

          {/* Past Bookings */}
          {past.length > 0 && (
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
              <h2 style={{ fontFamily: 'Syne', fontSize: 20, fontWeight: 700, color: 'var(--ink)', marginBottom: 20 }}>Past Bookings</h2>
              {past.map((b: any) => <BookingRow key={b.id} booking={b} />)}
            </div>
          )}
        </div>
      </main>
    </>
  )
}

function BookingRow({ booking }: { booking: any }) {
  const provider = booking.service_providers
  const providerName = provider?.users?.full_name || 'Provider'
  const status = booking.status as string
  const style = STATUS_STYLES[status] || STATUS_STYLES.confirmed

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne', fontSize: 18, fontWeight: 700, color: 'var(--accent)', flexShrink: 0 }}>
        {providerName[0]}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)', marginBottom: 2 }}>{booking.service_type} with {providerName}</div>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>📅 {booking.date} · {booking.time_slot} · {booking.address}</div>
      </div>
      <div style={{ fontFamily: 'Syne', fontSize: 16, fontWeight: 700, color: 'var(--ink)', marginRight: 12 }}>
        ${(booking.total_amount / 100).toFixed(0)}
      </div>
      <span style={{ padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600, background: style.bg, color: style.color }}>
        {status.replace('_', ' ')}
      </span>
    </div>
  )
}
