export type UserRole = 'customer' | 'provider' | 'admin'

export interface User {
  id: string
  email: string
  full_name: string
  role: UserRole
  avatar_url?: string
  created_at: string
}

export interface ServiceProvider {
  id: string
  user_id: string
  category: string
  bio: string
  price_per_hour: number
  latitude: number
  longitude: number
  address: string
  avg_rating: number
  total_reviews: number
  is_verified: boolean
  is_active: boolean
  created_at: string
  // joined from users table
  full_name?: string
  avatar_url?: string
  email?: string
}

export interface Booking {
  id: string
  customer_id: string
  provider_id: string
  service_type: string
  date: string
  time_slot: string
  status: BookingStatus
  total_amount: number
  stripe_payment_id?: string
  notes?: string
  address: string
  created_at: string
  // joined
  provider?: ServiceProvider
  customer?: User
}

export type BookingStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'

export interface Review {
  id: string
  booking_id: string
  reviewer_id: string
  provider_id: string
  rating: number
  comment: string
  created_at: string
  reviewer?: User
}

export interface SearchFilters {
  query: string
  category: string
  maxDistance: number
  maxPrice: number
  minRating: number
  availableToday: boolean
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}
