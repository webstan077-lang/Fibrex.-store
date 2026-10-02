-- ==============================================================================
-- 5. TABLE: order ("orders")
-- Supabase Target: PostgreSQL
-- Description: Stores customer checkout orders, shipping addresses, statuses.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS "order" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT NOT NULL UNIQUE,
    customer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    store_id UUID REFERENCES store(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    shipping_address JSONB NOT NULL,
    subtotal_ngn NUMERIC(14, 2) NOT NULL CHECK (subtotal_ngn >= 0),
    discount_ngn NUMERIC(14, 2) DEFAULT 0,
    shipping_ngn NUMERIC(14, 2) DEFAULT 0,
    tax_ngn NUMERIC(14, 2) DEFAULT 0,
    total_ngn NUMERIC(14, 2) NOT NULL CHECK (total_ngn >= 0),
    currency VARCHAR(4) DEFAULT 'NGN',
    order_status TEXT NOT NULL DEFAULT 'Pending' 
        CHECK (order_status IN ('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded')),
    payment_status TEXT NOT NULL DEFAULT 'Paid' 
        CHECK (payment_status IN ('Paid', 'Pending', 'Refunded', 'Failed')),
    fulfillment_status TEXT NOT NULL DEFAULT 'Unfulfilled',
    payment_method TEXT NOT NULL DEFAULT 'card',
    tracking_number TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexing
CREATE INDEX IF NOT EXISTS idx_order_number ON "order"(order_number);
CREATE INDEX IF NOT EXISTS idx_order_customer ON "order"(customer_id);
CREATE INDEX IF NOT EXISTS idx_order_store ON "order"(store_id);

-- Enable Row Level Security (RLS)
ALTER TABLE "order" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers view own orders" ON "order" FOR SELECT USING (true);
CREATE POLICY "Customers create orders" ON "order" FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins full orders control" ON "order" FOR ALL USING (true);
