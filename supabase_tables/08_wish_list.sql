-- ==============================================================================
-- 8. TABLE: wish_list
-- Supabase Target: PostgreSQL
-- Description: Stores customer bookmarked and saved products.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS wish_list (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES product(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, product_id)
);

-- Indexing
CREATE INDEX IF NOT EXISTS idx_wish_list_user ON wish_list(user_id);
CREATE INDEX IF NOT EXISTS idx_wish_list_product ON wish_list(product_id);

-- Enable Row Level Security (RLS)
ALTER TABLE wish_list ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own wish list" ON wish_list FOR ALL USING (true);
