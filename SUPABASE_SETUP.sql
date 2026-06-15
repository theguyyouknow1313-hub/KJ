-- ═══════════════════════════════════════════════════════════
-- SAKHA v1 — SUPABASE SQL SETUP
-- Run this entire file in: Supabase Dashboard > SQL Editor > New Query
-- ═══════════════════════════════════════════════════════════

-- 1. USERS TABLE
create table if not exists sakha_users (
  id                  uuid default gen_random_uuid() primary key,
  name                text not null,
  email               text not null,
  phone               text not null,
  city                text,
  education_level     text,
  agreed_to_terms     boolean default false,
  language_preference text default 'english',
  self_declared_type  text,
  is_premium          boolean default false,
  created_at          timestamp with time zone default now()
);

-- 2. SUBMISSIONS TABLE
create table if not exists sakha_submissions (
  id               uuid default gen_random_uuid() primary key,
  user_id          uuid references sakha_users(id),
  answers          jsonb not null,
  scores           jsonb not null,
  personality_type text,
  personality_label text,
  overall_risk     integer,
  layer_scores     jsonb,
  dim_scores       jsonb,
  ai_report        text,
  ai_model_used    text,
  is_paid          boolean default false,
  payment_id       text,
  payment_gateway  text,
  created_at       timestamp with time zone default now()
);

-- 3. ADMIN CONFIG TABLE
create table if not exists sakha_config (
  key        text primary key,
  value      text not null,
  updated_at timestamp with time zone default now()
);

-- 4. API LOG TABLE
create table if not exists sakha_api_log (
  id           uuid default gen_random_uuid() primary key,
  api_key      text,
  endpoint     text,
  credits_used integer default 1,
  created_at   timestamp with time zone default now()
);

-- 5. DEFAULT CONFIG VALUES
insert into sakha_config (key, value) values
  ('report_price_inr',    '49'),
  ('report_free',         'false'),
  ('active_gateway',      'razorpay'),
  ('ai_model_free',       'gemini'),
  ('ai_model_premium',    'claude'),
  ('premium_enabled',     'true'),
  ('app_version',         '1.0.0'),
  ('crisis_popup_enabled','true'),
  ('api_access_enabled',  'false'),
  ('api_price_per_call',  '5')
on conflict (key) do nothing;

-- 6. ROW LEVEL SECURITY
alter table sakha_users        enable row level security;
alter table sakha_submissions  enable row level security;
alter table sakha_config       enable row level security;
alter table sakha_api_log      enable row level security;

-- 7. RLS POLICIES
-- Allow anyone to create a user (take the test)
create policy "public_insert_users"
  on sakha_users for insert with check (true);

-- Allow anyone to submit a diagnostic
create policy "public_insert_submissions"
  on sakha_submissions for insert with check (true);

-- Allow frontend to read config (for price, free mode etc)
create policy "public_read_config"
  on sakha_config for select using (true);

-- Allow config updates (tighten this with admin role in v2)
create policy "public_update_config"
  on sakha_config for update using (true);

create policy "public_insert_config"
  on sakha_config for insert with check (true);

-- 8. INDEXES (for performance at scale)
create index if not exists idx_submissions_user_id
  on sakha_submissions(user_id);

create index if not exists idx_submissions_created_at
  on sakha_submissions(created_at desc);

create index if not exists idx_submissions_personality
  on sakha_submissions(personality_type);

create index if not exists idx_users_email
  on sakha_users(email);

-- ═══════════════════════════════════════════════════════════
-- DONE. Your Sakha database is ready.
-- Go to Settings > API to get your URL and anon key.
-- ═══════════════════════════════════════════════════════════
