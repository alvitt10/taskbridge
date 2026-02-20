import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const providerId = searchParams.get('providerId')
  const date = searchParams.get('date')

  if (!providerId || !date) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data } = await supabase
    .from('bookings')
    .select('time_slot')
    .eq('provider_id', providerId)
    .eq('date', date)
    .in('status', ['confirmed', 'pending_payment', 'in_progress'])

  const takenSlots = (data || []).map((b: any) => b.time_slot)
  return NextResponse.json({ takenSlots })
}
