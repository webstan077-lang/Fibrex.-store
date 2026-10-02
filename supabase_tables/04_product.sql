-- ==============================================================================
-- 4. TABLE: product
-- Supabase Target: PostgreSQL
-- Description: Stores catalog items, pricing (NGN), inventory, discounts, specs.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS product (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES store(id) ON DELETE CASCADE,
    category_id UUID REFERENCES category(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    category_slug TEXT,
    subcategory TEXT,
    price_ngn NUMERIC(14, 2) NOT NULL CHECK (price_ngn >= 0),
    original_price_ngn NUMERIC(14, 2),
    cost_price_ngn NUMERIC(14, 2),
    currency VARCHAR(4) DEFAULT 'NGN',
    discount_percent INT DEFAULT 0 CHECK (discount_percent BETWEEN 0 AND 100),
    stock INT NOT NULL DEFAULT 50 CHECK (stock >= 0),
    sku VARCHAR(64),
    brand TEXT,
    badge TEXT,
    rating NUMERIC(3, 2) DEFAULT 5.00 CHECK (rating BETWEEN 0 AND 5),
    review_count INT DEFAULT 0 CHECK (review_count >= 0),
    sold_count INT DEFAULT 0 CHECK (sold_count >= 0),
    description TEXT,
    specifications JSONB DEFAULT '[]'::jsonb,
    images TEXT[] DEFAULT ARRAY[]::TEXT[],
    variants JSONB DEFAULT '[]'::jsonb,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_flash_deal BOOLEAN DEFAULT FALSE,
    is_recommended BOOLEAN DEFAULT TRUE,
    is_best_seller BOOLEAN DEFAULT FALSE,
    is_new_arrival BOOLEAN DEFAULT FALSE,
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexing
CREATE INDEX IF NOT EXISTS idx_product_slug ON product(slug);
CREATE INDEX IF NOT EXISTS idx_product_store ON product(store_id);
CREATE INDEX IF NOT EXISTS idx_product_category ON product(category_id);
CREATE INDEX IF NOT EXISTS idx_product_status ON product(status);

-- Enable Row Level Security (RLS)
ALTER TABLE product ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read published products" ON product FOR SELECT USING (status = 'published');
CREATE POLICY "Admins and merchants manage products" ON product FOR ALL USING (true);
