-- ==============================================================================
-- 6. TABLE: order_items
-- Supabase Target: PostgreSQL
-- Description: Stores line items associated with each customer order.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES "order"(id) ON DELETE CASCADE,
    product_id UUID REFERENCES product(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    product_image TEXT,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price_ngn NUMERIC(14, 2) NOT NULL CHECK (unit_price_ngn >= 0),
    total_price_ngn NUMERIC(14, 2) NOT NULL CHECK (total_price_ngn >= 0),
    selected_variants JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexing
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

-- Enable Row Level Security (RLS)
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read order items" ON order_items FOR SELECT USING (true);
CREATE POLICY "Insert order items" ON order_items FOR INSERT WITH CHECK (true);
