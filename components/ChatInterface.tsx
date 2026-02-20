'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { ChatMessage } from '@/types'

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: "Hi! I'm TaskBridge's AI assistant. Describe what you need help with — like \"my kitchen faucet is leaking\" — and I'll find you the right professional. 👋" }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage() {
    if (!input.trim() || loading) return
    const userMsg: ChatMessage = { role: 'user', content: input }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })
      const data = await res.json()
      const reply = data.message as string
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])

      // If AI recommends a category, redirect to search
      const match = reply.match(/RECOMMEND_CATEGORY:\s*(.+)/i)
      if (match) {
        const category = match[1].trim()
        setTimeout(() => router.push(`/search?category=${encodeURIComponent(category)}`), 1500)
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I ran into an issue. Please try again!" }])
    } finally {
      setLoading(false)
    }
  }

  const QUICK_REPLIES = ["I have a leaky faucet 🔧", "My circuit keeps tripping ⚡", "Need house cleaning 🧹", "Looking for a painter 🎨"]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 68px)' }}>
      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '32px 40px', display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 800, width: '100%', margin: '0 auto' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
            {msg.role === 'assistant' && (
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'white', fontSize: 14, fontWeight: 700 }}>✦</div>
            )}
            <div style={{
              background: msg.role === 'user' ? 'var(--ink)' : 'white',
              color: msg.role === 'user' ? 'white' : 'var(--text)',
              border: `1px solid ${msg.role === 'user' ? 'var(--ink)' : 'var(--border)'}`,
              borderRadius: 16, padding: '14px 18px', fontSize: 15, lineHeight: 1.7,
              borderTopRightRadius: msg.role === 'user' ? 4 : 16,
              borderTopLeftRadius: msg.role === 'assistant' ? 4 : 16,
            }}>
              {msg.content.replace(/RECOMMEND_CATEGORY:.*$/i, '').trim()}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: 12, alignSelf: 'flex-start', maxWidth: '80%' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'white', fontSize: 14 }}>✦</div>
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 16, borderTopLeftRadius: 4, padding: '14px 18px' }}>
              <div style={{ display: 'flex', gap: 4 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--muted2)', animation: `bounce 0.6s ${i * 0.15}s infinite` }} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quick replies — only show after first AI message */}
        {messages.length === 1 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingLeft: 48 }}>
            {QUICK_REPLIES.map(q => (
              <button key={q} onClick={() => { setInput(q); setTimeout(() => sendMessage(), 100) }}
                style={{ padding: '8px 16px', background: 'white', border: '1px solid var(--border)', borderRadius: 999, fontSize: 14, color: 'var(--muted)', cursor: 'pointer' }}>
                {q}
              </button>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '20px 40px', borderTop: '1px solid var(--border)', background: 'var(--paper)', maxWidth: 800, width: '100%', margin: '0 auto', alignSelf: 'center' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
            placeholder="Describe what you need help with..."
            rows={1}
            style={{
              flex: 1, background: 'white', border: '1.5px solid var(--border)',
              borderRadius: 12, padding: '14px 18px', fontFamily: 'Instrument Sans, sans-serif',
              fontSize: 15, color: 'var(--text)', resize: 'none', outline: 'none',
              minHeight: 50, maxHeight: 120,
            }}
          />
          <button onClick={sendMessage} disabled={!input.trim() || loading}
            style={{ width: 50, height: 50, background: 'var(--accent)', border: 'none', borderRadius: 12, color: 'white', fontSize: 18, cursor: 'pointer', flexShrink: 0, transition: 'all .2s', opacity: !input.trim() ? 0.5 : 1 }}>
            ↑
          </button>
        </div>
        <p style={{ fontSize: 12, color: 'var(--muted2)', marginTop: 8, textAlign: 'center' }}>Powered by GPT-4o · Your conversation is private</p>
      </div>

      <style>{`@keyframes bounce { 0%, 60%, 100% { transform: translateY(0) } 30% { transform: translateY(-8px) } }`}</style>
    </div>
  )
}
