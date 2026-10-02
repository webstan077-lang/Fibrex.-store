-- ==============================================================================
-- 2. TABLE: store
-- Supabase Target: PostgreSQL
-- Description: Stores vendor/merchant stores, brand profiles, and outlet configs.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS store (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    logo_url TEXT,
    banner_url TEXT,
    category TEXT DEFAULT 'General Retail',
    country TEXT DEFAULT 'Nigeria',
    currency VARCHAR(4) DEFAULT 'NGN',
    theme TEXT DEFAULT 'modern' CHECK (theme IN ('modern', 'vibrant', 'minimal', 'luxe')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexing
CREATE INDEX IF NOT EXISTS idx_store_slug ON store(slug);
CREATE INDEX IF NOT EXISTS idx_store_owner ON store(owner_id);

-- Enable Row Level Security (RLS)
ALTER TABLE store ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active stores" ON store FOR SELECT USING (status = 'active');
CREATE POLICY "Store owners manage own store" ON store FOR ALL USING (true);
