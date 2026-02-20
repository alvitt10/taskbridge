import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, createAdminClient } from '@/lib/supabase-server'
import { stripe } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  const supabaseUser = createServerClient()
  const { data: { session } } = await supabaseUser.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const body = await req.json()
  const { providerId, serviceType, date, timeSlot, address, notes, hours, totalCents } = body

  if (!providerId || !date || !timeSlot || !address) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // Check for double booking
  const { data: conflicts } = await supabase
    .from('bookings')
    .select('id')
    .eq('provider_id', providerId)
    .eq('date', date)
    .eq('time_slot', timeSlot)
    .in('status', ['confirmed', 'pending_payment', 'in_progress'])

  if (conflicts && conflicts.length > 0) {
    return NextResponse.json({ error: 'This time slot is no longer available. Please choose another.' }, { status: 409 })
  }

  // Get provider details for Stripe metadata
  const { data: provider } = await supabase
    .from('service_providers')
    .select('*, users!inner(full_name, email)')
    .eq('id', providerId)
    .single()

  if (!provider) {
    return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
  }

  const platformFee = Math.round(totalCents * 0.05)

  // Create Stripe Payment Intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalCents,
    currency: 'cad',
    metadata: {
      customerId: session.user.id,
      providerId,
      date,
      timeSlot,
    },
    description: `TaskBridge: ${serviceType} with ${(provider as any).users?.full_name}`,
  })

  // Create booking record in 'pending_payment' state
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert({
      customer_id: session.user.id,
      provider_id: providerId,
      service_type: serviceType,
      date,
      time_slot: timeSlot,
      duration_hours: hours || 2,
      status: 'pending_payment',
      total_amount: totalCents,
      platform_fee: platformFee,
      stripe_payment_id: paymentIntent.id,
      notes,
      address,
    })
    .select()
    .single()

  if (bookingError) {
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }

  return NextResponse.json({
    bookingId: booking.id,
    clientSecret: paymentIntent.client_secret,
  })
}
