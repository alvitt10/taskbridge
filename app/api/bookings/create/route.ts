import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-server'
import { stripe } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  // Read Bearer token from Authorization header — works with both
  // cookie-based AND localStorage-based Supabase sessions
  const authHeader = req.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const supabase = createAdminClient()

  // Verify the token and get the user
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)

  if (authError || !user) {
    return NextResponse.json({ error: 'Invalid session. Please log in again.' }, { status: 401 })
  }

  const body = await req.json()
  const { providerId, serviceType, date, timeSlot, address, notes, hours, totalCents } = body

  if (!providerId || !date || !timeSlot || !address) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Check for double booking
  const { data: conflicts } = await supabase
    .from('bookings')
    .select('id')
    .eq('provider_id', providerId)
    .eq('date', date)
    .eq('time_slot', timeSlot)
    .in('status', ['confirmed', 'pending_payment', 'in_progress'])

  if (conflicts && conflicts.length > 0) {
    return NextResponse.json({ error: 'This time slot is no longer available.' }, { status: 409 })
  }

  const { data: provider } = await supabase
    .from('service_providers')
    .select('*, users!inner(full_name, email)')
    .eq('id', providerId)
    .single()

  if (!provider) {
    return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
  }

  const platformFee = Math.round(totalCents * 0.05)

  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalCents,
    currency: 'cad',
    metadata: { customerId: user.id, providerId, date, timeSlot },
    description: `TaskBridge: ${serviceType} with ${(provider as any).users?.full_name}`,
  })

  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert({
      customer_id: user.id,
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
    console.error('Booking insert error:', bookingError)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }

  return NextResponse.json({
    bookingId: booking.id,
    clientSecret: paymentIntent.client_secret,
  })
}
