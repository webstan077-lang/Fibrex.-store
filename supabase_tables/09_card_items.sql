-- ==============================================================================
-- 9. TABLE: card_items (Shopping Cart Items)
-- Supabase Target: PostgreSQL
-- Description: Stores active shopping cart items for user checkouts.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS card_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES product(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    selected_variant JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexing
CREATE INDEX IF NOT EXISTS idx_card_items_user ON card_items(user_id);
CREATE INDEX IF NOT EXISTS idx_card_items_product ON card_items(product_id);

-- Enable Row Level Security (RLS)
ALTER TABLE card_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own card items" ON card_items FOR ALL USING (true);
