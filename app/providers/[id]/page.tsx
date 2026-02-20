import { createAdminClient } from '@/lib/supabase-server'
import Nav from '@/components/Nav'
import BookingModalClient from './BookingModalClient'

export default async function ProviderPage({ params }: { params: { id: string } }) {
  const supabase = createAdminClient()

  const { data: provider } = await supabase
    .from('service_providers')
    .select('*, users!inner(full_name, email, avatar_url)')
    .eq('id', params.id)
    .single()

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, users!reviewer_id(full_name)')
    .eq('provider_id', params.id)
    .order('created_at', { ascending: false })
    .limit(10)

  if (!provider) {
    return (
      <>
        <Nav />
        <div style={{ paddingTop: 68, textAlign: 'center', padding: 80 }}>
          <h2>Provider not found</h2>
        </div>
      </>
    )
  }

  const p = { ...provider, full_name: (provider as any).users?.full_name || 'Provider' }
  const initial = p.full_name[0].toUpperCase()

  return (
    <>
      <Nav />
      <main style={{ paddingTop: 68 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 48px' }}>
          {/* Back */}
          <a href="/search" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--muted)', fontSize: 14, textDecoration: 'none', marginBottom: 28 }}>← Back to Search</a>

          {/* Hero */}
          <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 20, padding: 40, display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 32, marginBottom: 28, alignItems: 'start' }}>
            <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'linear-gradient(135deg, #1a3a2a, #0f4a33)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne', fontSize: 40, fontWeight: 800, color: 'white', border: '3px solid var(--accent)' }}>{initial}</div>
            <div>
              <h1 style={{ fontFamily: 'Syne', fontSize: 32, fontWeight: 800, color: 'var(--ink)', marginBottom: 8 }}>{p.full_name}</h1>
              <p style={{ color: 'var(--muted)', marginBottom: 16 }}>{provider.category} · {provider.city} · {provider.is_verified ? '✓ Verified' : 'Pending verification'}</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {provider.is_verified && <span style={{ background: 'var(--accent-light)', color: 'var(--accent)', border: '1px solid rgba(26,107,74,.2)', padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600 }}>✓ Background Checked</span>}
                <span style={{ background: '#dbeafe', color: '#1d4ed8', border: '1px solid rgba(29,78,216,.2)', padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600 }}>✓ ID Verified</span>
                <span style={{ background: 'var(--accent-light)', color: 'var(--accent)', border: '1px solid rgba(26,107,74,.2)', padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600 }}>✓ Insured</span>
              </div>
              <div style={{ display: 'flex', gap: 28, marginTop: 20 }}>
                {[
                  [`${provider.avg_rating}★`, 'Rating'],
                  [String(provider.total_reviews), 'Reviews'],
                  [`${provider.years_experience}yr`, 'Experience'],
                  ['97%', 'Completion'],
                ].map(([v, l]) => (
                  <div key={l}>
                    <div style={{ fontFamily: 'Syne', fontSize: 24, fontWeight: 700, color: 'var(--accent)' }}>{v}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Booking Panel */}
            <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, minWidth: 240 }}>
              <div style={{ fontFamily: 'Syne', fontSize: 36, fontWeight: 900, color: 'var(--ink)', marginBottom: 4 }}>
                ${provider.price_per_hour}<span style={{ fontFamily: 'Instrument Sans', fontSize: 14, fontWeight: 400, color: 'var(--muted)' }}>/hr</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>+ materials if required</p>
              <BookingModalClient provider={p as any} />
              <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {['Identity verified', 'Background checked', 'Fully insured', 'Stripe secure payment'].map(t => (
                  <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--muted)' }}>
                    <span style={{ color: 'var(--accent)' }}>✓</span> {t}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
            {/* About + Reviews */}
            <div>
              <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 16, padding: 24, marginBottom: 20 }}>
                <h3 style={{ fontFamily: 'Syne', fontSize: 18, fontWeight: 700, color: 'var(--ink)', marginBottom: 12 }}>About</h3>
                <p style={{ color: 'var(--muted)', lineHeight: 1.8 }}>{provider.bio || 'This provider has not added a bio yet.'}</p>
              </div>

              <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
                <h3 style={{ fontFamily: 'Syne', fontSize: 18, fontWeight: 700, color: 'var(--ink)', marginBottom: 20 }}>Reviews ({provider.total_reviews})</h3>
                {reviews && reviews.length > 0 ? reviews.map((r: any) => (
                  <div key={r.id} style={{ borderBottom: '1px solid var(--border)', paddingBottom: 20, marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)' }}>{r.users?.full_name || 'Customer'}</div>
                        <div style={{ color: '#f59e0b', fontSize: 14 }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{new Date(r.created_at).toLocaleDateString()}</div>
                    </div>
                    <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7 }}>{r.comment}</p>
                  </div>
                )) : (
                  <p style={{ color: 'var(--muted)' }}>No reviews yet. Be the first to book!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
