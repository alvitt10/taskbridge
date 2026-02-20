import Link from 'next/link'
import type { ServiceProvider } from '@/types'

const CATEGORY_COLORS: Record<string, string> = {
  Plumbing: 'linear-gradient(135deg, #1a3a2a, #0f4a33)',
  Electrical: 'linear-gradient(135deg, #1a2a4a, #0f3060)',
  Cleaning: 'linear-gradient(135deg, #3a1a2a, #600f20)',
  Landscaping: 'linear-gradient(135deg, #1a3a1a, #0f4a0f)',
  Painting: 'linear-gradient(135deg, #3a2a1a, #4a2a0f)',
  Moving: 'linear-gradient(135deg, #2a1a3a, #3a0f4a)',
  default: 'linear-gradient(135deg, #2a2a2a, #1a1a1a)',
}

export default function ProviderCard({ provider, onBook }: {
  provider: ServiceProvider & { distance_km?: number }
  onBook?: () => void
}) {
  const bg = CATEGORY_COLORS[provider.category] || CATEGORY_COLORS.default
  const initial = (provider.full_name || 'P')[0].toUpperCase()

  return (
    <div style={{
      background: 'white', border: '1px solid var(--border)',
      borderRadius: 20, overflow: 'hidden',
      transition: 'all .3s', cursor: 'pointer',
    }}
    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-6px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 24px 80px rgba(0,0,0,.1)' }}
    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = '' }}
    >
      {/* Card Top */}
      <div style={{ height: 160, background: bg, position: 'relative', display: 'flex', alignItems: 'flex-end', padding: 20 }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          border: '3px solid white', background: 'rgba(255,255,255,.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, color: 'white',
          boxShadow: '0 4px 16px rgba(0,0,0,.2)',
        }}>{initial}</div>

        {provider.is_verified && (
          <div style={{
            position: 'absolute', bottom: 16, right: 20,
            background: 'white', borderRadius: 999, padding: '5px 12px',
            fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5,
            color: 'var(--accent)',
          }}>✓ Verified</div>
        )}
      </div>

      {/* Card Body */}
      <div style={{ padding: '20px 24px 24px' }}>
        <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>
          {provider.full_name}
        </div>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 14 }}>
          {provider.category}
          {provider.distance_km != null && ` · ${provider.distance_km}km away`}
        </div>

        <div style={{ display: 'flex', gap: 20, marginBottom: 18, paddingBottom: 18, borderBottom: '1px solid var(--border)' }}>
          <Stat val={`${provider.avg_rating}★`} label="Rating" />
          <Stat val={String(provider.total_reviews)} label="Reviews" />
          <Stat val={`${provider.years_experience}yr`} label="Exp." />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 800, color: 'var(--ink)' }}>
            ${provider.price_per_hour}<span style={{ fontFamily: 'Instrument Sans', fontSize: 13, fontWeight: 400, color: 'var(--muted)' }}>/hr</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link href={`/providers/${provider.id}`}
              style={{ padding: '9px 16px', background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 999, fontSize: 13, fontWeight: 500, color: 'var(--muted)', textDecoration: 'none' }}>
              Profile
            </Link>
            <button onClick={onBook}
              style={{ padding: '9px 20px', background: 'var(--ink)', color: 'white', border: 'none', borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              Book
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Stat({ val, label }: { val: string, label: string }) {
  return (
    <div>
      <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 17, fontWeight: 700, color: 'var(--ink)' }}>{val}</div>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>{label}</div>
    </div>
  )
}
