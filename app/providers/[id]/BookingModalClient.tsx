'use client'
import { useState } from 'react'
import BookingModal from '@/components/BookingModal'
import type { ServiceProvider } from '@/types'

export default function BookingModalClient({ provider }: { provider: ServiceProvider & { full_name: string } }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)}
        style={{ width: '100%', padding: 14, background: 'var(--ink)', color: 'white', border: 'none', borderRadius: 999, fontSize: 15, fontWeight: 600, cursor: 'pointer', marginBottom: 10 }}>
        Book Appointment
      </button>
      <button style={{ width: '100%', padding: 11, background: 'transparent', border: '1px solid var(--border)', borderRadius: 999, fontSize: 13, color: 'var(--muted)', cursor: 'pointer' }}>
        💬 Message Provider
      </button>
      {open && <BookingModal provider={provider} onClose={() => setOpen(false)} />}
    </>
  )
}
