import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lat = parseFloat(searchParams.get('lat') || '43.6532')
  const lng = parseFloat(searchParams.get('lng') || '-79.3832')
  const category = searchParams.get('category') || null
  const maxPrice = parseInt(searchParams.get('maxPrice') || '200')
  const minRating = parseFloat(searchParams.get('minRating') || '0')
  const radiusKm = parseFloat(searchParams.get('radius') || '25')
  const query = searchParams.get('q') || ''

  const supabase = createAdminClient()

  try {
    // Use the PostGIS function for location-based search
    let dbQuery = supabase.rpc('nearby_providers', {
      search_lat: lat,
      search_lng: lng,
      radius_km: radiusKm,
      cat: category,
    })

    const { data, error } = await dbQuery

    if (error) throw error

    // Apply additional filters client-side (Supabase RPC doesn't support chainable filters well)
    let results = data || []

    if (maxPrice < 200) results = results.filter((p: any) => p.price_per_hour <= maxPrice)
    if (minRating > 0) results = results.filter((p: any) => p.avg_rating >= minRating)
    if (query) results = results.filter((p: any) =>
      p.full_name.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase())
    )

    return NextResponse.json({ providers: results })
  } catch (error: any) {
    console.error('Search error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
