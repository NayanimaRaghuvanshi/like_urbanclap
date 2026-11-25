-- HomeServ production schema (PostgreSQL 15+ with PostGIS).
-- The app ships with a JSON-file store (src/lib/db.ts) for zero-setup demos; this schema is the
-- target for production. Keep column names aligned with src/lib/types.ts.

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(15) UNIQUE NOT NULL,
  email VARCHAR(100),
  phone_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(60) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(15) UNIQUE NOT NULL,
  email VARCHAR(100),
  photo_url TEXT,
  categories TEXT[] NOT NULL,
  speciality VARCHAR(100),
  experience_years INT,
  rating DECIMAL(2,1) DEFAULT 0,
  total_jobs INT DEFAULT 0,
  aadhaar_verified BOOLEAN DEFAULT false,
  police_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  location GEOGRAPHY(POINT, 4326),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE provider_leave (
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  leave_date DATE NOT NULL,
  PRIMARY KEY (provider_id, leave_date)
);

CREATE TABLE services (
  id VARCHAR(40) PRIMARY KEY,
  category VARCHAR(50) NOT NULL,
  sub_category VARCHAR(60) NOT NULL,
  name VARCHAR(120) NOT NULL,
  description TEXT,
  starting_price DECIMAL(10,2) NOT NULL,
  mrp DECIMAL(10,2),
  unit VARCHAR(20),
  duration_minutes INT NOT NULL,
  inclusions TEXT[] DEFAULT '{}',
  is_package BOOLEAN DEFAULT false,
  is_consultation BOOLEAN DEFAULT false,
  rating DECIMAL(3,2) DEFAULT 0,
  total_bookings INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_number VARCHAR(20) UNIQUE NOT NULL,          -- HS-2026-1125-0042
  customer_id UUID REFERENCES customers(id),
  provider_id UUID REFERENCES providers(id),
  category VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'confirmed'
    CHECK (status IN ('confirmed','assigned','on_way','started','completed','cancelled')),
  booking_date DATE NOT NULL,                          -- operating day (IST)
  slot_minutes INT NOT NULL CHECK (slot_minutes BETWEEN 540 AND 1440), -- 9:00 AM .. 12:00 AM
  address_line1 VARCHAR(200) NOT NULL,
  building VARCHAR(200) NOT NULL,
  landmark VARCHAR(200),
  locality VARCHAR(200) NOT NULL,
  pin_code VARCHAR(6) NOT NULL,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  reason TEXT NOT NULL,
  photo_urls TEXT[] DEFAULT '{}',
  subtotal DECIMAL(10,2) NOT NULL,
  visiting_charge DECIMAL(10,2) DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  gst DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','refunded')),
  payment_method VARCHAR(20) CHECK (payment_method IN ('after_service','online')),
  payment_ref TEXT,
  start_otp VARCHAR(4) NOT NULL,
  end_otp VARCHAR(4) NOT NULL,
  cancel_fee DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX bookings_slot_idx ON bookings (category, booking_date, slot_minutes) WHERE status <> 'cancelled';
CREATE INDEX bookings_provider_idx ON bookings (provider_id, booking_date) WHERE status <> 'cancelled';

CREATE TABLE booking_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  service_id VARCHAR(40) REFERENCES services(id),
  quantity INT DEFAULT 1,
  price DECIMAL(10,2) NOT NULL,
  duration_minutes INT NOT NULL
);

CREATE TABLE booking_events (
  id BIGSERIAL PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL,
  note TEXT,
  at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID UNIQUE REFERENCES bookings(id),
  customer_id UUID REFERENCES customers(id),
  provider_id UUID REFERENCES providers(id),
  service_id VARCHAR(40) REFERENCES services(id),
  rating INT CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT,
  admin_reply TEXT,
  is_hidden BOOLEAN DEFAULT false,
  is_flagged BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE slot_settings (
  category VARCHAR(50) PRIMARY KEY,
  max_per_slot INT
);
CREATE TABLE blocked_slots (
  block_date DATE NOT NULL,
  slot_minutes INT, -- NULL = whole day
  UNIQUE (block_date, slot_minutes)
);

CREATE TABLE promos (
  code VARCHAR(20) PRIMARY KEY,
  percent INT NOT NULL,
  max_off DECIMAL(10,2) NOT NULL,
  min_order DECIMAL(10,2) DEFAULT 0,
  active BOOLEAN DEFAULT true
);

CREATE TABLE waitlist (
  id BIGSERIAL PRIMARY KEY,
  phone VARCHAR(15),
  email VARCHAR(100),
  locality VARCHAR(200),
  location GEOGRAPHY(POINT, 4326),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Serviceability check (2 km from base) — mirrors src/lib/geo.ts:
-- SELECT ST_DWithin(
--   ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
--   ST_SetSRID(ST_MakePoint(:base_lng, :base_lat), 4326)::geography,
--   2000);
