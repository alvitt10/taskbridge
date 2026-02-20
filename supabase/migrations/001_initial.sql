-- ============================================================
-- TASKBRIDGE DATABASE SCHEMA
-- Run this entire file in Supabase SQL Editor
-- ============================================================

-- Enable PostGIS for location-based queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================================
-- USERS TABLE
-- Extends Supabase auth.users with app-specific fields
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT UNIQUE NOT NULL,
  full_name     TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'customer'
                CHECK (role IN ('customer', 'provider', 'admin')),
  avatar_url    TEXT,
  phone         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- SERVICE PROVIDERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.service_providers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category        TEXT NOT NULL,
  subcategory     TEXT,
  bio             TEXT,
  price_per_hour  INTEGER NOT NULL DEFAULT 60,  -- stored in dollars
  location        GEOGRAPHY(POINT, 4326),        -- PostGIS point
  address         TEXT,
  city            TEXT,
  province        TEXT DEFAULT 'ON',
  avg_rating      NUMERIC(3,2) DEFAULT 0,
  total_reviews   INTEGER DEFAULT 0,
  is_verified     BOOLEAN DEFAULT FALSE,
  is_active       BOOLEAN DEFAULT TRUE,
  years_experience INTEGER DEFAULT 0,
  certifications  TEXT[],
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast location queries
CREATE INDEX IF NOT EXISTS idx_providers_location
  ON public.service_providers USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_providers_category
  ON public.service_providers (category);
CREATE INDEX IF NOT EXISTS idx_providers_active
  ON public.service_providers (is_active) WHERE is_active = TRUE;

-- ============================================================
-- BOOKINGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.bookings (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id         UUID NOT NULL REFERENCES public.users(id),
  provider_id         UUID NOT NULL REFERENCES public.service_providers(id),
  service_type        TEXT NOT NULL,
  date                DATE NOT NULL,
  time_slot           TEXT NOT NULL,
  duration_hours      NUMERIC(3,1) DEFAULT 2,
  status              TEXT NOT NULL DEFAULT 'pending_payment'
                      CHECK (status IN (
                        'pending_payment', 'confirmed', 'in_progress',
                        'completed', 'cancelled', 'refunded'
                      )),
  total_amount        INTEGER NOT NULL,  -- in cents
  platform_fee        INTEGER NOT NULL DEFAULT 0, -- in cents
  stripe_payment_id   TEXT,
  stripe_transfer_id  TEXT,
  notes               TEXT,
  address             TEXT NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent double booking
  UNIQUE (provider_id, date, time_slot)
);

CREATE INDEX IF NOT EXISTS idx_bookings_customer ON public.bookings (customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_provider ON public.bookings (provider_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON public.bookings (date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings (status);

-- ============================================================
-- REVIEWS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id    UUID NOT NULL UNIQUE REFERENCES public.bookings(id),
  reviewer_id   UUID NOT NULL REFERENCES public.users(id),
  provider_id   UUID NOT NULL REFERENCES public.service_providers(id),
  rating        INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update provider's avg_rating when a review is added
CREATE OR REPLACE FUNCTION update_provider_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.service_providers
  SET
    avg_rating = (
      SELECT ROUND(AVG(rating)::numeric, 2)
      FROM public.reviews
      WHERE provider_id = NEW.provider_id
    ),
    total_reviews = (
      SELECT COUNT(*) FROM public.reviews WHERE provider_id = NEW.provider_id
    )
  WHERE id = NEW.provider_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_review_created
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_provider_rating();

-- ============================================================
-- MESSAGES TABLE (in-app messaging)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id  UUID NOT NULL REFERENCES public.bookings(id),
  sender_id   UUID NOT NULL REFERENCES public.users(id),
  content     TEXT NOT NULL,
  read_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_booking ON public.messages (booking_id);

-- ============================================================
-- GEOSEARCH FUNCTION
-- Find providers within radius_km of a lat/lng point
-- ============================================================
CREATE OR REPLACE FUNCTION nearby_providers(
  search_lat    FLOAT,
  search_lng    FLOAT,
  radius_km     FLOAT DEFAULT 25,
  cat           TEXT DEFAULT NULL
)
RETURNS TABLE (
  id              UUID,
  user_id         UUID,
  full_name       TEXT,
  category        TEXT,
  bio             TEXT,
  price_per_hour  INTEGER,
  avg_rating      NUMERIC,
  total_reviews   INTEGER,
  is_verified     BOOLEAN,
  years_experience INTEGER,
  address         TEXT,
  city            TEXT,
  distance_km     FLOAT
)
LANGUAGE SQL STABLE AS $$
  SELECT
    sp.id,
    sp.user_id,
    u.full_name,
    sp.category,
    sp.bio,
    sp.price_per_hour,
    sp.avg_rating,
    sp.total_reviews,
    sp.is_verified,
    sp.years_experience,
    sp.address,
    sp.city,
    ROUND((ST_Distance(
      ST_MakePoint(search_lng, search_lat)::geography,
      sp.location
    ) / 1000)::numeric, 1)::float AS distance_km
  FROM public.service_providers sp
  JOIN public.users u ON u.id = sp.user_id
  WHERE
    sp.is_active = TRUE
    AND ST_DWithin(
      ST_MakePoint(search_lng, search_lat)::geography,
      sp.location,
      radius_km * 1000
    )
    AND (cat IS NULL OR sp.category ILIKE cat)
  ORDER BY distance_km ASC;
$$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Users: anyone can read profiles, only owner can update
CREATE POLICY "Public profiles are viewable" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Providers: public read, owner can update
CREATE POLICY "Providers are publicly viewable" ON public.service_providers FOR SELECT USING (true);
CREATE POLICY "Provider can update own profile" ON public.service_providers
  FOR ALL USING (auth.uid() = user_id);

-- Bookings: only parties involved can see
CREATE POLICY "Customers see own bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Providers see their bookings" ON public.bookings
  FOR SELECT USING (
    provider_id IN (SELECT id FROM public.service_providers WHERE user_id = auth.uid())
  );
CREATE POLICY "Authenticated users can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Parties can update booking" ON public.bookings
  FOR UPDATE USING (
    auth.uid() = customer_id OR
    provider_id IN (SELECT id FROM public.service_providers WHERE user_id = auth.uid())
  );

-- Reviews: public read, reviewer can create
CREATE POLICY "Reviews are public" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Reviewer can create review" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Messages: only booking parties
CREATE POLICY "Booking parties can read messages" ON public.messages
  FOR SELECT USING (
    booking_id IN (
      SELECT id FROM public.bookings
      WHERE customer_id = auth.uid()
      OR provider_id IN (SELECT id FROM public.service_providers WHERE user_id = auth.uid())
    )
  );
CREATE POLICY "Booking parties can send messages" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- ============================================================
-- SEED: Sample providers for development
-- (Replace lat/lng with your city's coordinates)
-- Toronto area sample data
-- ============================================================
-- NOTE: Run this only after creating your first real user accounts.
-- Uncomment and fill in real user UUIDs from your auth.users table.

/*
INSERT INTO public.service_providers
  (user_id, category, bio, price_per_hour, location, address, city, years_experience, is_verified)
VALUES
  ('YOUR_USER_UUID_1', 'Plumbing',
   'Licensed master plumber, 12 years experience. Specializing in leak detection and pipe replacement.',
   85, ST_MakePoint(-79.3832, 43.6532)::geography, '123 Main St', 'Toronto', 12, true),
  ('YOUR_USER_UUID_2', 'Electrical',
   'Licensed electrician, panel upgrades and smart home installs.',
   95, ST_MakePoint(-79.4000, 43.6600)::geography, '456 King St W', 'Toronto', 15, true);
*/
