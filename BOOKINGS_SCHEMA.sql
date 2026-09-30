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
