<<<<<<< HEAD
# TaskBridge — Full Setup Guide

> AI-Powered Local Services Platform  
> Team: Shoaib, Rohan, Alvitt, Sadaf · COSC4406E · Nipissing University

---

## What's Built

| Feature | Status |
|---|---|
| Landing page (hero, categories, how it works, provider CTA) | ✅ |
| User signup / login (customer + provider roles) | ✅ |
| Email verification via Supabase | ✅ |
| AI chatbot (OpenAI GPT-4o-mini) | ✅ |
| Search with filters (category, distance, price, rating) | ✅ |
| Location-based provider search (PostGIS) | ✅ |
| Provider profiles with reviews | ✅ |
| Booking system with conflict detection | ✅ |
| Stripe payments with escrow | ✅ |
| Customer dashboard | ✅ |
| Provider dashboard (earnings, upcoming bookings) | ✅ |
| Provider onboarding flow (3-step) | ✅ |
| Route protection (middleware) | ✅ |
| Stripe webhooks (auto-confirm bookings on payment) | ✅ |

---

## Setup in 4 Steps

### Step 1 — Create Your Accounts (20 min)

1. **GitHub** → github.com → Create account + new repo called `taskbridge`
2. **Vercel** → vercel.com → Sign up with GitHub (one click)
3. **Supabase** → supabase.com → New project → save the password → go to Settings → API, copy:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (from "service_role" section)
4. **Stripe** → stripe.com → Developers → API Keys → copy test keys
5. **OpenAI** → platform.openai.com → API Keys → create key → copy immediately

---

### Step 2 — Set Up Database (5 min)

In Supabase dashboard → **SQL Editor** → paste the entire contents of:
```
supabase/migrations/001_initial.sql
```
Click **Run**. This creates all 5 tables, PostGIS functions, and Row Level Security policies.

Also in Supabase → **Authentication → URL Configuration**:
- Site URL: `http://localhost:3000` (change to your Vercel URL after deploy)
- Redirect URLs: add `http://localhost:3000/auth/callback` and `https://YOUR-APP.vercel.app/auth/callback`

---

### Step 3 — Local Development

```bash
# Clone your repo
git clone https://github.com/YOUR_USERNAME/taskbridge.git
cd taskbridge

# Install dependencies
npm install

# Create env file
cp .env.local.example .env.local
# Now fill in all the values in .env.local

# Start dev server
npm run dev
```

Open **http://localhost:3000** — your app is running!

---

### Step 4 — Deploy to Vercel (2 min)

1. Push your code to GitHub:
```bash
git add .
git commit -m "Initial TaskBridge setup"
git push
```

2. Go to **vercel.com/new** → Import your GitHub repo
3. Add all environment variables from your `.env.local`
4. Click **Deploy** → your app is live at `yourapp.vercel.app`

---

## Setting Up Stripe Webhooks

For payments to automatically confirm bookings, you need to set up a webhook:

```bash
# Install Stripe CLI (optional but helpful for testing)
npm install -g @stripe/stripe-cli

# Listen locally
stripe listen --forward-to localhost:3000/api/payments/webhook
```

In production (Vercel):
1. Stripe Dashboard → Developers → Webhooks → Add endpoint
2. URL: `https://YOUR-APP.vercel.app/api/payments/webhook`
3. Events to listen for: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copy the webhook secret → add as `STRIPE_WEBHOOK_SECRET` in Vercel

---

## Seeding Test Data

After creating your first accounts, go to Supabase SQL Editor and run:

```sql
-- First, get your user ID from the auth.users table
SELECT id, email FROM auth.users;

-- Then insert a test provider (replace UUID with your actual user ID)
INSERT INTO public.service_providers
  (user_id, category, bio, price_per_hour, location, address, city, years_experience, is_verified)
VALUES
  ('YOUR-USER-UUID-HERE', 'Plumbing',
   'Licensed master plumber, 12 years experience.',
   85,
   ST_MakePoint(-79.3832, 43.6532)::geography,
   '123 Main St', 'Toronto', 12, true);
```

---

## Test Payments

Use Stripe test card: **4242 4242 4242 4242**
- Any future expiry date
- Any 3-digit CVC
- Any postal code

---

## Going Live

1. Switch Stripe to live keys in Vercel environment variables
2. Update Supabase redirect URLs to your production domain
3. Set `NEXT_PUBLIC_APP_URL` to your production URL
4. Set up a custom domain in Vercel settings

---

## Stack Reference

| Service | Purpose | Free Tier |
|---|---|---|
| Supabase | Database + Auth + Storage | 500MB DB, 50k MAU |
| Vercel | Frontend hosting + API routes | Unlimited deployments |
| OpenAI | AI chatbot (gpt-4o-mini) | Pay per use (~$2/mo) |
| Stripe | Payments + escrow | 2.9% + 30¢ per transaction |
| Google Maps | Location + geocoding | $200/mo free credit |
=======
# taskbridge
>>>>>>> 7a43c73e67dd136a1ee68fa9a7ab12eb5e6ee974
