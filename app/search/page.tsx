'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Nav from '@/components/Nav'
import ProviderCard from '@/components/ProviderCard'
import BookingModal from '@/components/BookingModal'
import type { ServiceProvider } from '@/types'

const CATEGORIES = ['All', 'Plumbing', 'Electrical', 'Cleaning', 'Landscaping', 'Painting', 'Moving', 'HVAC', 'Carpentry', 'Handyman']

export default function SearchPage() {
  const searchParams = useSearchParams()
  const [providers, setProviders] = useState<ServiceProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProvider, setSelectedProvider] = useState<(ServiceProvider & { full_name: string }) | null>(null)
  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    category: searchParams.get('category') || 'All',
    maxPrice: 200,
    minRating: 0,
    radius: 25,
  })

  const fetchProviders = useCallback(async () => {
    setLoading(true)
    // Default to Toronto for demo; in production use browser geolocation
    const params = new URLSearchParams({
      lat: '43.6532', lng: '-79.3832',
      q: filters.q,
      category: filters.category === 'All' ? '' : filters.category,
      maxPrice: String(filters.maxPrice),
      minRating: String(filters.minRating),
      radius: String(filters.radius),
    })
    try {
      const res = await fetch(`/api/search?${params}`)
      const data = await res.json()
      setProviders(data.providers || [])
    } catch (e) {
      setProviders([])
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    const debounce = setTimeout(fetchProviders, 300)
    return () => clearTimeout(debounce)
  }, [fetchProviders])

  return (
    <>
      <Nav />
      <main style={{ paddingTop: 68 }}>
        {/* Search Hero */}
        <div style={{ background: 'white', borderBottom: '1px solid var(--border)', padding: '32px 48px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1, background: 'var(--paper)', border: '1.5px solid var(--border)', borderRadius: 12, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span>🔍</span>
                <input type="text" value={filters.q} placeholder="Search providers..."
                  style={{ flex: 1, border: 'none', background: 'none', fontFamily: 'Instrument Sans, sans-serif', fontSize: 16, outline: 'none', color: 'var(--text)' }}
                  onChange={e => setFilters(f => ({ ...f, q: e.target.value }))} />
              </div>
              <button onClick={fetchProviders} style={{ padding: '0 28px', background: 'var(--ink)', color: 'white', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
                Search
              </button>
            </div>

            {/* Category Pills */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setFilters(f => ({ ...f, category: c }))}
                  style={{
                    padding: '7px 16px', borderRadius: 999, fontSize: 13, cursor: 'pointer',
                    border: `1px solid ${filters.category === c ? 'var(--accent)' : 'var(--border)'}`,
                    background: filters.category === c ? 'var(--accent-light)' : 'white',
                    color: filters.category === c ? 'var(--accent)' : 'var(--muted)',
                    fontWeight: filters.category === c ? 600 : 400,
                  }}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 48px', display: 'grid', gridTemplateColumns: '260px 1fr', gap: 32, alignItems: 'start' }}>
          {/* Filters Sidebar */}
          <aside style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 16, padding: 24, position: 'sticky', top: 84 }}>
            <h3 style={{ fontFamily: 'Syne', fontSize: 16, fontWeight: 700, color: 'var(--ink)', marginBottom: 24 }}>Filters</h3>

            <FilterGroup label="Max Distance">
              <input type="range" min={1} max={50} value={filters.radius}
                onChange={e => setFilters(f => ({ ...f, radius: Number(e.target.value) }))}
                style={{ width: '100%', accentColor: 'var(--accent)' }} />
              <div style={{ fontSize: 13, color: 'var(--accent)', fontFamily: 'monospace', marginTop: 4 }}>{filters.radius}km</div>
            </FilterGroup>

            <FilterGroup label="Max Price ($/hr)">
              <input type="range" min={20} max={200} step={5} value={filters.maxPrice}
                onChange={e => setFilters(f => ({ ...f, maxPrice: Number(e.target.value) }))}
                style={{ width: '100%', accentColor: 'var(--accent)' }} />
              <div style={{ fontSize: 13, color: 'var(--accent)', fontFamily: 'monospace', marginTop: 4 }}>${filters.maxPrice}/hr</div>
            </FilterGroup>

            <FilterGroup label="Min Rating">
              {[{ v: 0, l: 'Any' }, { v: 4, l: '4.0+' }, { v: 4.5, l: '4.5+' }, { v: 4.8, l: '4.8+ ⭐ Top' }].map(r => (
                <label key={r.v} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', fontSize: 14, color: 'var(--muted)', cursor: 'pointer' }}>
                  <input type="radio" name="rating" checked={filters.minRating === r.v}
                    onChange={() => setFilters(f => ({ ...f, minRating: r.v }))}
                    style={{ accentColor: 'var(--accent)' }} />
                  {r.l}
                </label>
              ))}
            </FilterGroup>
          </aside>

          {/* Results */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <p style={{ fontSize: 14, color: 'var(--muted)' }}>
                {loading ? 'Searching...' : <><strong style={{ color: 'var(--ink)' }}>{providers.length}</strong> providers found</>}
              </p>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: 80, color: 'var(--muted)' }}>
                <div style={{ fontSize: 32, marginBottom: 16 }}>🔍</div>
                <p>Finding providers near you...</p>
              </div>
            ) : providers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 80, color: 'var(--muted)' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>😕</div>
                <h3 style={{ fontFamily: 'Syne', fontSize: 20, color: 'var(--ink)', marginBottom: 8 }}>No providers found</h3>
                <p>Try adjusting your filters or increasing the search radius.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                {providers.map(p => (
                  <ProviderCard key={p.id} provider={p as any}
                    onBook={() => setSelectedProvider(p as any)} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {selectedProvider && (
        <BookingModal provider={selectedProvider} onClose={() => setSelectedProvider(null)} />
      )}
    </>
  )
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--muted)', marginBottom: 10 }}>{label}</div>
      {children}
    </div>
  )
}
