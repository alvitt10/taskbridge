'use client'
import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import type { ServiceProvider } from '@/types'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const TIME_SLOTS = ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM']
const SERVICE_TYPES = ['General Inspection', 'Leak/Break Repair', 'Installation', 'Maintenance', 'Emergency Call', 'Other']

interface Props {
  provider: ServiceProvider & { full_name: string }
  onClose: () => void
}

export default function BookingModal({ provider, onClose }: Props) {
  const [step, setStep] = useState<'details' | 'payment' | 'success'>('details')
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    serviceType: SERVICE_TYPES[0],
    date: '',
    timeSlot: '',
    address: '',
    notes: '',
    hours: 2,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [takenSlots, setTakenSlots] = useState<string[]>([])

  const totalCents = provider.price_per_hour * form.hours * 100
  const feeCents = Math.round(totalCents * 0.05)
  const grandTotal = totalCents + feeCents

  async function checkAvailability(date: string) {
    if (!date) return
    const res = await fetch(`/api/availability?providerId=${provider.id}&date=${date}`)
    const data = await res.json()
    setTakenSlots(data.takenSlots || [])
  }

  async function handleProceedToPayment() {
    if (!form.date || !form.timeSlot || !form.address) {
      setError('Please fill in all required fields')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, providerId: provider.id, totalCents: grandTotal }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create booking')
      setClientSecret(data.clientSecret)
      setBookingId(data.bookingId)
      setStep('payment')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(13,13,13,.7)', backdropFilter: 'blur(12px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background: 'white', borderRadius: 24, padding: 48, maxWidth: 520, width: '100%', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>

        {/* Close */}
        <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, width: 36, height: 36, background: 'var(--paper)', border: 'none', borderRadius: '50%', cursor: 'pointer', fontSize: 16 }}>✕</button>

        {step === 'success' ? (
          <SuccessView bookingId={bookingId!} onClose={onClose} />
        ) : (
          <>
            <h2 style={{ fontFamily: 'Syne', fontSize: 26, fontWeight: 800, color: 'var(--ink)', marginBottom: 4 }}>
              {step === 'details' ? 'Book Appointment' : 'Secure Payment'}
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 28 }}>
              With {provider.full_name} · ${provider.price_per_hour}/hr
            </p>

            {step === 'details' && (
              <>
                <FormGroup label="Service Type">
                  <select style={inputStyle} value={form.serviceType} onChange={e => setForm(f => ({ ...f, serviceType: e.target.value }))}>
                    {SERVICE_TYPES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </FormGroup>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <FormGroup label="Date *">
                    <input type="date" style={inputStyle} min={new Date().toISOString().split('T')[0]}
                      value={form.date}
                      onChange={e => { setForm(f => ({ ...f, date: e.target.value, timeSlot: '' })); checkAvailability(e.target.value) }} />
                  </FormGroup>
                  <FormGroup label="Duration">
                    <select style={inputStyle} value={form.hours} onChange={e => setForm(f => ({ ...f, hours: Number(e.target.value) }))}>
                      {[1, 2, 3, 4].map(h => <option key={h} value={h}>{h} hour{h > 1 ? 's' : ''}</option>)}
                    </select>
                  </FormGroup>
                </div>

                <FormGroup label="Time Slot *">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                    {TIME_SLOTS.map(slot => {
                      const taken = takenSlots.includes(slot)
                      const selected = form.timeSlot === slot
                      return (
                        <button key={slot} disabled={taken}
                          onClick={() => !taken && setForm(f => ({ ...f, timeSlot: slot }))}
                          style={{
                            padding: '10px 8px', borderRadius: 8, fontSize: 13, cursor: taken ? 'not-allowed' : 'pointer',
                            border: `1.5px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
                            background: selected ? 'var(--accent-light)' : taken ? 'var(--paper2)' : 'white',
                            color: taken ? 'var(--muted2)' : selected ? 'var(--accent)' : 'var(--text)',
                            textDecoration: taken ? 'line-through' : 'none',
                          }}>
                          {slot}
                        </button>
                      )
                    })}
                  </div>
                </FormGroup>

                <FormGroup label="Service Address *">
                  <input type="text" style={inputStyle} placeholder="Your full address..."
                    value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
                </FormGroup>

                <FormGroup label="Notes (optional)">
                  <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
                    placeholder="Describe the issue in detail..."
                    value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
                </FormGroup>

                {/* Price Summary */}
                <div style={{ background: 'var(--paper)', borderRadius: 12, padding: 16, marginBottom: 20 }}>
                  <PriceLine label={`Service (${form.hours}hr × $${provider.price_per_hour})`} value={`$${(totalCents / 100).toFixed(2)}`} />
                  <PriceLine label="Platform fee (5%)" value={`$${(feeCents / 100).toFixed(2)}`} />
                  <div style={{ borderTop: '1px solid var(--border)', marginTop: 10, paddingTop: 10, display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: 'var(--ink)' }}>
                    <span>Total (held in escrow)</span>
                    <span style={{ color: 'var(--accent)' }}>${(grandTotal / 100).toFixed(2)}</span>
                  </div>
                </div>

                {error && <p style={{ color: 'var(--red)', fontSize: 14, marginBottom: 12 }}>{error}</p>}

                <button onClick={handleProceedToPayment} disabled={loading}
                  style={{ width: '100%', padding: 16, background: 'var(--ink)', color: 'white', border: 'none', borderRadius: 999, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
                  {loading ? <span className="spinner" /> : `Continue to Payment →`}
                </button>
              </>
            )}

            {step === 'payment' && clientSecret && (
              <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                <PaymentForm
                  clientSecret={clientSecret}
                  bookingId={bookingId!}
                  amount={grandTotal}
                  onSuccess={() => setStep('success')}
                  onBack={() => setStep('details')}
                />
              </Elements>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function PaymentForm({ clientSecret, bookingId, amount, onSuccess, onBack }: {
  clientSecret: string, bookingId: string, amount: number, onSuccess: () => void, onBack: () => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handlePay() {
    if (!stripe || !elements) return
    setLoading(true)
    setError('')
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: 'if_required',
    })
    if (error) {
      setError(error.message || 'Payment failed')
      setLoading(false)
    } else {
      onSuccess()
    }
  }

  return (
    <>
      <PaymentElement />
      <div style={{ background: 'var(--accent-light)', borderRadius: 8, padding: '12px 16px', marginTop: 16, fontSize: 13, color: 'var(--accent2)' }}>
        🔒 Your payment of <strong>${(amount / 100).toFixed(2)}</strong> is held securely in escrow and only released once the job is complete.
      </div>
      {error && <p style={{ color: 'var(--red)', fontSize: 14, marginTop: 12 }}>{error}</p>}
      <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
        <button onClick={onBack} style={{ flex: 1, padding: 14, background: 'transparent', border: '1px solid var(--border)', borderRadius: 999, cursor: 'pointer', fontSize: 14 }}>← Back</button>
        <button onClick={handlePay} disabled={loading || !stripe}
          style={{ flex: 2, padding: 14, background: 'var(--ink)', color: 'white', border: 'none', borderRadius: 999, cursor: 'pointer', fontSize: 15, fontWeight: 600 }}>
          {loading ? <span className="spinner" /> : `Pay $${(amount / 100).toFixed(2)}`}
        </button>
      </div>
    </>
  )
}

function SuccessView({ bookingId, onClose }: { bookingId: string, onClose: () => void }) {
  return (
    <div style={{ textAlign: 'center', padding: '20px 0' }}>
      <div style={{ fontSize: 64, marginBottom: 20 }}>🎉</div>
      <h3 style={{ fontFamily: 'Syne', fontSize: 26, fontWeight: 800, color: 'var(--ink)', marginBottom: 12 }}>Booking Confirmed!</h3>
      <p style={{ color: 'var(--muted)', fontSize: 15, marginBottom: 20 }}>
        Your payment is secured in escrow. The provider has been notified and will confirm within 15 minutes.
      </p>
      <div style={{ background: 'var(--paper)', borderRadius: 12, padding: 16, fontFamily: 'monospace', fontSize: 16, color: 'var(--accent)', letterSpacing: '.1em', marginBottom: 28 }}>
        #{bookingId.slice(0, 8).toUpperCase()}
      </div>
      <a href="/dashboard" style={{ display: 'inline-block', padding: '14px 28px', background: 'var(--accent)', color: 'white', borderRadius: 999, fontWeight: 600, fontSize: 15, textDecoration: 'none' }}>
        View in Dashboard →
      </a>
    </div>
  )
}

function FormGroup({ label, children }: { label: string, children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--muted)', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  )
}

function PriceLine({ label, value }: { label: string, value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--muted)', marginBottom: 6 }}>
      <span>{label}</span><span>{value}</span>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 16px',
  background: 'var(--paper)', border: '1.5px solid var(--border)',
  borderRadius: 10, fontFamily: 'Instrument Sans, sans-serif',
  fontSize: 15, color: 'var(--text)', outline: 'none',
}
