import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase-server'
import type Stripe from 'stripe'

// IMPORTANT: Stripe requires raw body for webhook signature verification
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  const supabase = createAdminClient()

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const pi = event.data.object as Stripe.PaymentIntent
      // Update booking to 'confirmed' when payment succeeds
      await supabase
        .from('bookings')
        .update({ status: 'confirmed' })
        .eq('stripe_payment_id', pi.id)
      console.log(`✅ Booking confirmed for payment ${pi.id}`)
      break
    }

    case 'payment_intent.payment_failed': {
      const pi = event.data.object as Stripe.PaymentIntent
      // Cancel the booking if payment fails
      await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('stripe_payment_id', pi.id)
      console.log(`❌ Booking cancelled for payment ${pi.id}`)
      break
    }

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
