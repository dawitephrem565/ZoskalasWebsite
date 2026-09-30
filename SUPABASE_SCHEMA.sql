-- ============================================================
-- ZOSCALES DIAMONDS — Supabase (PostgreSQL) Schema
-- Run this ONCE in Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- 1. MEMBERSHIP USERS
CREATE TABLE IF NOT EXISTS zoscales_users (
  id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  phone          TEXT UNIQUE NOT NULL,
  status         TEXT NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending','approved','declined')),
  otp_code       TEXT,
  otp_expires_at BIGINT,
  approved_at    BIGINT,
  created_at     BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW())::BIGINT)
);

-- 2. ADMIN-UPLOADED IMAGES (public or private)
CREATE TABLE IF NOT EXISTS zoscales_images (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title      TEXT,
  url        TEXT NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'public'
             CHECK (visibility IN ('public','private')),
  created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW())::BIGINT)
);

-- 3. MEMBER IMAGE ACCESS (private images + how long they last)
CREATE TABLE IF NOT EXISTS zoscales_member_access (
  id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id        BIGINT NOT NULL REFERENCES zoscales_users(id) ON DELETE CASCADE,
  image_id       BIGINT NOT NULL REFERENCES zoscales_images(id) ON DELETE CASCADE,
  duration_hours INT NOT NULL DEFAULT 1,
  published_at   BIGINT,
  expires_at     BIGINT,
  created_at     BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW())::BIGINT),
  UNIQUE (user_id, image_id)
);

-- 4. DYNAMIC WEBSITE CONTENT (admin edits live)
CREATE TABLE IF NOT EXISTS zoscales_content (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  section    TEXT NOT NULL,
  key        TEXT NOT NULL,
  value      TEXT,
  image_url  TEXT,
  updated_at BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW())::BIGINT),
  UNIQUE (section, key)
);

CREATE INDEX IF NOT EXISTS idx_users_phone ON zoscales_users (phone);
CREATE INDEX IF NOT EXISTS idx_users_status ON zoscales_users (status);
CREATE INDEX IF NOT EXISTS idx_access_user ON zoscales_member_access (user_id, expires_at);
CREATE INDEX IF NOT EXISTS idx_content_section ON zoscales_content (section);

-- 5. RLS: enable but add NO policies.
--    Service Role Key bypasses RLS, so server works;
--    anon/public keys CANNOT touch these tables.
ALTER TABLE zoscales_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE zoscales_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE zoscales_member_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE zoscales_content ENABLE ROW LEVEL SECURITY;

-- 6. STORAGE BUCKET for admin images (public read, service-role write)
INSERT INTO storage.buckets (id, name, public)
VALUES ('zs-images', 'zs-images', TRUE)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- FLOW
-- 1. User enters phone → INSERT zoscales_users (status='pending')
-- 2. Admin (admin.html) accepts → status='approved', OTP created,
--    zoscales_member_access rows created (duration_hours, expires_at)
-- 3. User re-opens modal → needsOtp=true → enters OTP
-- 4. OTP cleared → private images shown until expires_at
-- ============================================================

-- ============================================================
-- ADDITIONS: Consultation Bookings (run if tables already created)
-- ============================================================
CREATE TABLE IF NOT EXISTS zoscales_bookings (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  phone         TEXT,
  consult_type  TEXT,
  preferred_date TEXT,
  showroom      TEXT,
  message       TEXT,
  status        TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','closed')),
  created_at    BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW())::BIGINT)
);
CREATE INDEX IF NOT EXISTS idx_bookings_created ON zoscales_bookings (created_at DESC);
ALTER TABLE zoscales_bookings ENABLE ROW LEVEL SECURITY;
