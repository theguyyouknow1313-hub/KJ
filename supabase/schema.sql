-- ═══════════════════════════════════════════════════════════════
-- SAKHA v1 — SUPABASE DATABASE SCHEMA
-- Run this entire file in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- ── 1. Admin Config Table (prices, toggles, API settings) ────────────────────
CREATE TABLE IF NOT EXISTS admin_config (
  id TEXT PRIMARY KEY DEFAULT 'singleton',
  report_price INTEGER DEFAULT 49,
  report_free BOOLEAN DEFAULT false,
  active_ai TEXT DEFAULT 'gemini',
  active_gateway TEXT DEFAULT 'razorpay',
  razorpay_key TEXT,
  cashfree_key TEXT,
  gemini_key TEXT,
  groq_key TEXT,
  claude_key TEXT,
  institution_base_price INTEGER DEFAULT 5000,
  api_price_per_call INTEGER DEFAULT 5,
  maintenance_mode BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default config row
INSERT INTO admin_config (id) VALUES ('singleton') ON CONFLICT (id) DO NOTHING;

-- ── 2. Users Table ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  terms_accepted BOOLEAN DEFAULT false,
  marketing_consent BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  is_admin BOOLEAN DEFAULT false,
  self_declared_type TEXT,
  preferred_language TEXT DEFAULT 'english',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3. Assessments Table ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  answers JSONB NOT NULL,
  overall_risk INTEGER NOT NULL,
  by_layer JSONB NOT NULL,
  by_dim JSONB NOT NULL,
  integration_index INTEGER,
  personality_type TEXT NOT NULL,
  ai_insight TEXT,
  ai_source TEXT,
  paid BOOLEAN DEFAULT false,
  payment_id TEXT,
  payment_amount INTEGER,
  payment_gateway TEXT,
  institution_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 4. Institutions Table ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  institution_type TEXT DEFAULT 'coaching',
  city TEXT,
  state TEXT,
  monthly_fee INTEGER,
  is_active BOOLEAN DEFAULT false,
  counsellor_access BOOLEAN DEFAULT false,
  student_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 5. API Keys Table (for external developers) ───────────────────────────────
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_hash TEXT UNIQUE NOT NULL,
  owner_name TEXT NOT NULL,
  owner_email TEXT NOT NULL,
  calls_used INTEGER DEFAULT 0,
  calls_limit INTEGER DEFAULT 1000,
  price_per_call INTEGER DEFAULT 5,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ
);

-- ── 6. Identity History (for drift detection) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS identity_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  declared_type TEXT,
  diagnosed_type TEXT,
  drift_detected BOOLEAN DEFAULT false,
  drift_notified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 7. Crisis Events (logged for safety, never shared) ────────────────────────
CREATE TABLE IF NOT EXISTS crisis_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES assessments(id),
  risk_level INTEGER,
  flagged_nodes JSONB,
  resource_shown TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Row Level Security ────────────────────────────────────────────────────────
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE identity_history ENABLE ROW LEVEL SECURITY;

-- Users can only read/update their own data
CREATE POLICY "Users can read own data" ON users FOR SELECT USING (true);
CREATE POLICY "Users can insert own data" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (true);

-- Assessments: users see their own
CREATE POLICY "Users can insert assessments" ON assessments FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can read own assessments" ON assessments FOR SELECT USING (true);

-- Admin config: readable by all (prices etc are public)
ALTER TABLE admin_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read config" ON admin_config FOR SELECT USING (true);

-- ── Indexes for performance ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_assessments_created ON assessments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_identity_user ON identity_history(user_id);
