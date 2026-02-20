import Nav from '@/components/Nav'
import ChatInterface from '@/components/ChatInterface'

export default function ChatPage() {
  return (
    <>
      <Nav />
      <main style={{ paddingTop: 68, height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ borderBottom: '1px solid var(--border)', padding: '16px 40px', display: 'flex', alignItems: 'center', gap: 14, background: 'white' }}>
          <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 18, fontWeight: 700 }}>✦</div>
          <div>
            <div style={{ fontFamily: 'Syne', fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>TaskBridge AI</div>
            <div style={{ fontSize: 12, color: 'var(--accent)' }}>● Online · Powered by GPT-4o</div>
          </div>
        </div>
        <ChatInterface />
      </main>
    </>
  )
}
