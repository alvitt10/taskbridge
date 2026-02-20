'use client'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function HomePage() {
  return (
    <>
      <Nav />
      <main>
        {/* HERO */}
        <section style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', textAlign: 'center',
          padding: '68px 24px 80px', position: 'relative', overflow: 'hidden',
          background: 'radial-gradient(ellipse 80% 60% at 60% 40%, rgba(26,107,74,.07) 0%, transparent 60%)',
        }}>
          {/* Grid background */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
            backgroundSize: '80px 80px', opacity: .4,
            maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px 6px 8px', background: 'white', border: '1px solid var(--border)', borderRadius: 999, fontSize: 13, color: 'var(--muted)', marginBottom: 40, boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
              <div style={{ width: 24, height: 24, background: 'var(--accent-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>✦</div>
              <span>AI-powered discovery · <strong style={{ color: 'var(--accent)' }}>2,400+ verified providers</strong></span>
            </div>

            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(52px, 8vw, 96px)', fontWeight: 800, lineHeight: .95, letterSpacing: '-.04em', color: 'var(--ink)', marginBottom: 28, maxWidth: 900 }}>
              Find <em style={{ fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', fontWeight: 400, color: 'var(--accent)' }}>trusted</em> local<br />service pros, fast.
            </h1>

            <p style={{ fontSize: 18, color: 'var(--muted)', lineHeight: 1.7, maxWidth: 500, margin: '0 auto 48px' }}>
              Describe what you need, or search directly. TaskBridge matches you with verified professionals — with real reviews and upfront pricing.
            </p>

            {/* Search Bar */}
            <div style={{ width: '100%', maxWidth: 640, background: 'white', border: '1.5px solid var(--border)', borderRadius: 999, padding: '6px 6px 6px 24px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 8px 40px rgba(0,0,0,.1)', margin: '0 auto 20px' }}>
              <span style={{ fontSize: 18 }}>🔍</span>
              <input type="text" placeholder="What do you need help with? e.g. leaky faucet..."
                style={{ flex: 1, border: 'none', outline: 'none', background: 'none', fontFamily: 'Instrument Sans, sans-serif', fontSize: 16, color: 'var(--text)' }}
                onKeyDown={e => { if (e.key === 'Enter') window.location.href = `/search?q=${(e.target as HTMLInputElement).value}` }} />
              <Link href="/search" style={{ padding: '12px 28px', background: 'var(--ink)', color: 'white', borderRadius: 999, fontSize: 15, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>Find pros →</Link>
            </div>

            {/* Pills */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
              {['🔧 Plumbing', '⚡ Electrical', '🧹 Cleaning', '🌿 Landscaping', '🎨 Painting', '📦 Moving'].map(p => (
                <Link key={p} href={`/search?category=${p.split(' ')[1]}`}
                  style={{ padding: '7px 14px', background: 'white', border: '1px solid var(--border)', borderRadius: 999, fontSize: 13, color: 'var(--muted)', textDecoration: 'none', transition: 'all .2s' }}>
                  {p}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* TRUST BAR */}
        <div style={{ background: 'var(--ink)', padding: '16px 48px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 48, flexWrap: 'wrap' }}>
          {[['2,400+', 'Verified providers'], ['18k', 'Jobs completed'], ['4.9★', 'Avg rating'], ['47min', 'Avg response'], ['100%', 'Background checked']].map(([n, l]) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 10, whiteSpace: 'nowrap' }}>
              <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 800, color: '#f7f5f0' }}>{n}</span>
              <span style={{ fontSize: 13, color: '#9a9590' }}>{l}</span>
            </div>
          ))}
        </div>

        {/* HOW IT WORKS */}
        <section style={{ padding: '120px 48px', maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 80 }}>
            <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.12em', color: 'var(--accent)', marginBottom: 16 }}>How it works</div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(36px, 5vw, 58px)', fontWeight: 800, letterSpacing: '-.03em', color: 'var(--ink)' }}>
              Booked in <em style={{ fontFamily: 'Instrument Serif', fontStyle: 'italic', fontWeight: 400 }}>minutes</em>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, background: 'var(--border)', borderRadius: 20, overflow: 'hidden' }}>
            {[
              { n: '01', icon: '💬', title: 'Describe your need', desc: 'Use our AI chat or search bar. Plain language works great — no technical jargon needed.' },
              { n: '02', icon: '🎯', title: 'Get matched', desc: 'We surface verified providers near you, ranked by rating, response time, and job fit.' },
              { n: '03', icon: '📅', title: 'Book & pay securely', desc: 'Pick your time slot and pay through Stripe. Your money is held in escrow until done.' },
              { n: '04', icon: '⭐', title: 'Leave a review', desc: 'Rate your experience. Funds release automatically. Great pros get more visibility.' },
            ].map(s => (
              <div key={s.n} style={{ background: 'white', padding: '40px 32px', transition: 'background .3s' }}
                onMouseEnter={e => (e.currentTarget as any).style.background = 'var(--ink)'}
                onMouseLeave={e => (e.currentTarget as any).style.background = 'white'}>
                <div style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--muted)', background: 'var(--paper2)', padding: '4px 10px', borderRadius: 999, display: 'inline-block', marginBottom: 32 }}>{s.n}</div>
                <div style={{ fontSize: 32, marginBottom: 16 }}>{s.icon}</div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 700, color: 'var(--ink)', marginBottom: 10 }}>{s.title}</div>
                <div style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CATEGORIES */}
        <section style={{ background: 'var(--ink)', padding: '120px 48px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 56 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.12em', color: '#4caf7d', marginBottom: 16 }}>Browse services</div>
                <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 48, fontWeight: 800, color: '#f7f5f0', letterSpacing: '-.03em' }}>Every home service<br /><em style={{ fontFamily: 'Instrument Serif', fontStyle: 'italic', fontWeight: 400 }}>covered</em></h2>
              </div>
              <Link href="/search" style={{ fontSize: 14, color: '#9a9590', textDecoration: 'none' }}>View all →</Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              {[
                { emoji: '🔧', name: 'Plumbing', count: '286 providers' },
                { emoji: '⚡', name: 'Electrical', count: '194 providers' },
                { emoji: '🧹', name: 'Cleaning', count: '412 providers' },
                { emoji: '🌿', name: 'Landscaping', count: '158 providers' },
                { emoji: '🎨', name: 'Painting', count: '203 providers' },
                { emoji: '📦', name: 'Moving', count: '87 providers' },
                { emoji: '❄️', name: 'HVAC', count: '96 providers' },
                { emoji: '🪚', name: 'Carpentry', count: '141 providers' },
              ].map(c => (
                <Link key={c.name} href={`/search?category=${c.name}`}
                  style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 20, padding: '32px 28px', textDecoration: 'none', transition: 'all .3s', display: 'block' }}
                  onMouseEnter={e => { (e.currentTarget as any).style.borderColor = 'var(--accent)'; (e.currentTarget as any).style.transform = 'translateY(-4px)' }}
                  onMouseLeave={e => { (e.currentTarget as any).style.borderColor = '#2a2a2a'; (e.currentTarget as any).style.transform = '' }}>
                  <div style={{ fontSize: 36, marginBottom: 16 }}>{c.emoji}</div>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 17, fontWeight: 700, color: '#f7f5f0', marginBottom: 4 }}>{c.name}</div>
                  <div style={{ fontSize: 13, color: '#9a9590' }}>{c.count}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* DUAL APPROACH CTA */}
        <section style={{ padding: '120px 48px', maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 48, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-.03em' }}>Two ways to find help</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {[
              { icon: '🤖', title: 'AI-Guided Discovery', color: '#e8f4ff', borderColor: '#b3d4f5', href: '/chat', desc: 'Describe your problem in plain English. Our AI asks the right questions and finds your perfect match.', badge: 'Recommended for new users' },
              { icon: '🔍', title: 'Search & Filter', color: 'var(--accent-light)', borderColor: '#a8d8c0', href: '/search', desc: 'Know what you need? Search directly, filter by distance, price, and rating. Book in under 60 seconds.', badge: 'Fastest path to booking' },
            ].map(a => (
              <Link key={a.title} href={a.href}
                style={{ background: a.color, border: `1px solid ${a.borderColor}`, borderRadius: 20, padding: 40, textDecoration: 'none', display: 'block', transition: 'all .3s' }}
                onMouseEnter={e => { (e.currentTarget as any).style.transform = 'translateY(-4px)'; (e.currentTarget as any).style.boxShadow = '0 20px 60px rgba(0,0,0,.1)' }}
                onMouseLeave={e => { (e.currentTarget as any).style.transform = ''; (e.currentTarget as any).style.boxShadow = '' }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>{a.icon}</div>
                <div style={{ fontFamily: 'Syne', fontSize: 22, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>{a.title}</div>
                <p style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 20 }}>{a.desc}</p>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '.08em' }}>{a.badge} →</span>
              </Link>
            ))}
          </div>
        </section>

        {/* PROVIDER CTA */}
        <section style={{ background: 'var(--ink)', padding: '120px 48px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -200, right: -200, width: 600, height: 600, background: 'radial-gradient(circle, rgba(26,107,74,.2), transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center', position: 'relative', zIndex: 1 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.12em', color: '#4caf7d', marginBottom: 20 }}>For professionals</div>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 48, fontWeight: 800, color: '#f7f5f0', letterSpacing: '-.03em', marginBottom: 20 }}>
                Grow your <em style={{ fontFamily: 'Instrument Serif', fontStyle: 'italic', fontWeight: 400 }}>business</em> with us
              </h2>
              <p style={{ fontSize: 16, color: '#9a9590', lineHeight: 1.8, marginBottom: 36 }}>
                Join 2,400+ verified professionals using TaskBridge to fill their schedule, manage bookings, and get paid on time.
              </p>
              <Link href="/auth/signup?role=provider"
                style={{ display: 'inline-block', padding: '16px 32px', background: 'var(--accent)', color: 'white', borderRadius: 999, fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>
                Apply as a provider →
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 20, padding: 28 }}>
                <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '.1em', color: '#9a9590', marginBottom: 8 }}>Average monthly earnings</div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 42, fontWeight: 800, color: '#f7f5f0' }}>$4,800</div>
                <div style={{ fontSize: 13, color: '#4caf7d', marginTop: 4 }}>↑ Top providers earn $8k+/month</div>
              </div>
              {['Smart scheduling fills your calendar', 'Get paid within 24hrs via Stripe', 'Build a verified 5-star reputation', 'We handle background checks & insurance'].map(p => (
                <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 12, fontSize: 14, color: 'rgba(255,255,255,.7)' }}>
                  <span style={{ color: '#4caf7d' }}>✓</span> {p}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
