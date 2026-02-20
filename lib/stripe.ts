import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

// Platform fee: 5% of total (adjust as needed)
export const PLATFORM_FEE_PERCENT = 0.05

export function calculateFees(hourlyRate: number, hours: number = 2) {
  const subtotal = hourlyRate * hours * 100 // in cents
  const platformFee = Math.round(subtotal * PLATFORM_FEE_PERCENT)
  const total = subtotal + platformFee
  return { subtotal, platformFee, total }
}
