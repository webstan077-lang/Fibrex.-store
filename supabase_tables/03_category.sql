-- ==============================================================================
-- 3. TABLE: category
-- Supabase Target: PostgreSQL
-- Description: Stores taxonomy categories, slugs, descriptions, and icons.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS category (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    icon TEXT,
    parent_id UUID REFERENCES category(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexing
CREATE INDEX IF NOT EXISTS idx_category_slug ON category(slug);

-- Enable Row Level Security (RLS)
ALTER TABLE category ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read categories" ON category FOR SELECT USING (true);
CREATE POLICY "Admins manage categories" ON category FOR ALL USING (true);
