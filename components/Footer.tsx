import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{ background: '#1a1a1a', padding: '80px 48px 40px', borderTop: '1px solid #2a2a2a' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 60, marginBottom: 60 }}>
          <div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, color: '#f7f5f0', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 8, height: 8, background: '#1a6b4a', borderRadius: '50%' }} />
              TaskBridge
            </div>
            <p style={{ fontSize: 14, color: '#9a9590', lineHeight: 1.7, marginBottom: 24, maxWidth: 280 }}>
              The smarter way to find and book trusted local service professionals.
            </p>
          </div>
          {[
            { title: 'Platform', links: ['How it works', 'Browse services', 'AI Assistant', 'Pricing'] },
            { title: 'Providers', links: ['Join as a pro', 'Provider dashboard', 'Earnings', 'Support'] },
            { title: 'Company', links: ['About', 'Blog', 'Privacy policy', 'Terms of service'] },
          ].map(col => (
            <div key={col.title}>
              <h4 style={{ fontSize: 12, fontWeight: 600, color: '#f7f5f0', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 20 }}>{col.title}</h4>
              {col.links.map(l => (
                <a key={l} href="#" style={{ display: 'block', fontSize: 14, color: '#9a9590', textDecoration: 'none', marginBottom: 12 }}>{l}</a>
              ))}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 32, borderTop: '1px solid #2a2a2a' }}>
          <p style={{ fontSize: 13, color: '#9a9590' }}>© 2026 TaskBridge · COSC4406E · Nipissing University</p>
          <div style={{ fontSize: 12, color: '#9a9590' }}>Built by Shoaib, Rohan, Alvitt & Sadaf</div>
        </div>
      </div>
    </footer>
  )
}
