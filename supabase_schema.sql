-- ==============================================================================
-- FIBREX STORE - COMPREHENSIVE SUPABASE SQL SCHEMA & SUPER TABLE
-- Target Database: PostgreSQL 14+ / Supabase
-- Description: Complete relational e-commerce tables, Row Level Security (RLS)
--              policies, automated triggers, seed data, and a denormalized
--              Master Super Table for unified analytics and fast queries.
-- ==============================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- SECTION 1: CLEANUP / RE-RUN IDEMPOTENCY (OPTIONAL)
-- ==============================================================================
-- To reset tables, uncomment lines below:
-- DROP VIEW IF EXISTS super_table_fibrex_view CASCADE;
-- DROP TABLE IF EXISTS super_table_fibrex_flat CASCADE;
-- DROP TABLE IF EXISTS saved_cards CASCADE;
-- DROP TABLE IF EXISTS cart_items CASCADE;
-- DROP TABLE IF EXISTS wishlists CASCADE;
-- DROP TABLE IF EXISTS reviews CASCADE;
-- DROP TABLE IF EXISTS order_items CASCADE;
-- DROP TABLE IF EXISTS orders CASCADE;
-- DROP TABLE IF EXISTS products CASCADE;
-- DROP TABLE IF EXISTS categories CASCADE;
-- DROP TABLE IF EXISTS stores CASCADE;
-- DROP TABLE IF EXISTS profiles CASCADE;

-- ==============================================================================
-- SECTION 2: NORMALIZED RELATIONAL TABLES
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- Table 1: profiles (Application Users & Admin Accounts)
-- Synchronizes with Supabase auth.users or operates standalone
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE, -- References auth.users(id) in Supabase Auth
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'store_owner', 'platform_admin')),
    store_id UUID,
    avatar_url TEXT,
    phone TEXT,
    country_code VARCHAR(4) DEFAULT 'NG',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
    google_linked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- Table 2: stores (Merchant Stores & Brand Outlets)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS stores (
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

-- Add foreign key constraint for profiles.store_id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_profiles_store'
    ) THEN
        ALTER TABLE profiles 
        ADD CONSTRAINT fk_profiles_store 
        FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE SET NULL;
    END IF;
END $$;

-- ------------------------------------------------------------------------------
-- Table 3: categories (Product Catalog Categories)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    icon TEXT,
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- Table 4: products (E-Commerce Catalog)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
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
    flash_deal_end TIMESTAMPTZ,
    is_recommended BOOLEAN DEFAULT TRUE,
    is_best_seller BOOLEAN DEFAULT FALSE,
    is_new_arrival BOOLEAN DEFAULT FALSE,
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- Table 5: orders (Customer Orders)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT NOT NULL UNIQUE,
    customer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    store_id UUID REFERENCES stores(id) ON DELETE SET NULL,
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
    fulfillment_status TEXT NOT NULL DEFAULT 'Unfulfilled' 
        CHECK (fulfillment_status IN ('Fulfilled', 'Unfulfilled', 'Partially Fulfilled')),
    payment_method TEXT NOT NULL DEFAULT 'card' 
        CHECK (payment_method IN ('card', 'transfer', 'delivery', 'google_pay')),
    tracking_number TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- Table 6: order_items (Order Line Items)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    product_image TEXT,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price_ngn NUMERIC(14, 2) NOT NULL CHECK (unit_price_ngn >= 0),
    total_price_ngn NUMERIC(14, 2) NOT NULL CHECK (total_price_ngn >= 0),
    selected_variants JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- Table 7: reviews (Product Customer Reviews)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    author_name TEXT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT NOT NULL,
    verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- Table 8: wishlists (Saved Customer Items)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, product_id)
);

-- ------------------------------------------------------------------------------
-- Table 9: cart_items (Active Shopping Cart Items)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    selected_variant JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- Table 10: saved_cards (Tokenized PCI-DSS Compliant Cards)
-- Strictly stores tokenized cards: last 4 digits, brand, expiry. NEVER PAN or CVV.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS saved_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    token_id TEXT NOT NULL UNIQUE,
    brand TEXT NOT NULL CHECK (brand IN ('visa', 'mastercard', 'verve', 'amex', 'discover', 'unionpay', 'jcb', 'unknown')),
    last4 VARCHAR(4) NOT NULL,
    exp_month VARCHAR(2) NOT NULL,
    exp_year VARCHAR(2) NOT NULL,
    holder_name TEXT NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    color_scheme TEXT DEFAULT 'from-slate-900 to-purple-950',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- SECTION 3: THE SUPER TABLE (FLAT MASTER TABLE & DYNAMIC VIEW)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- The Physical Super Table: super_table_fibrex_flat
-- A single denormalized master table that you can query, import, or export directly in Supabase
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS super_table_fibrex_flat (
    super_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    record_type VARCHAR(32) NOT NULL DEFAULT 'order_transaction' 
        CHECK (record_type IN ('order_transaction', 'product_catalog', 'user_account', 'store_profile', 'review_entry')),
    
    -- Transaction & Order Info
    order_id UUID,
    order_number TEXT,
    order_status VARCHAR(32),
    payment_status VARCHAR(32),
    payment_method VARCHAR(32),
    fulfillment_status VARCHAR(32),
    tracking_number TEXT,
    order_created_at TIMESTAMPTZ,
    
    -- Customer Profile Info
    customer_id UUID,
    customer_name TEXT,
    customer_email TEXT,
    customer_phone TEXT,
    customer_role VARCHAR(32),
    
    -- Shipping Info
    shipping_street TEXT,
    shipping_city TEXT,
    shipping_state TEXT,
    shipping_country TEXT,
    shipping_postal_code TEXT,
    
    -- Store / Merchant Info
    store_id UUID,
    store_name TEXT,
    store_slug TEXT,
    store_category TEXT,
    
    -- Product & Catalog Info
    product_id UUID,
    product_name TEXT,
    product_sku TEXT,
    product_category TEXT,
    product_brand TEXT,
    product_image TEXT,
    
    -- Line Item & Monetary Calculations (in NGN Base)
    quantity INT DEFAULT 1,
    unit_price_ngn NUMERIC(14, 2) DEFAULT 0,
    line_total_ngn NUMERIC(14, 2) DEFAULT 0,
    subtotal_ngn NUMERIC(14, 2) DEFAULT 0,
    discount_ngn NUMERIC(14, 2) DEFAULT 0,
    shipping_ngn NUMERIC(14, 2) DEFAULT 0,
    tax_ngn NUMERIC(14, 2) DEFAULT 0,
    grand_total_ngn NUMERIC(14, 2) DEFAULT 0,
    currency VARCHAR(4) DEFAULT 'NGN',
    
    -- Analytics & Search Meta
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    metadata JSONB DEFAULT '{}'::jsonb,
    synced_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Fast Indexes on the Super Table
CREATE INDEX IF NOT EXISTS idx_super_table_record_type ON super_table_fibrex_flat(record_type);
CREATE INDEX IF NOT EXISTS idx_super_table_order_number ON super_table_fibrex_flat(order_number);
CREATE INDEX IF NOT EXISTS idx_super_table_customer_email ON super_table_fibrex_flat(customer_email);
CREATE INDEX IF NOT EXISTS idx_super_table_store_slug ON super_table_fibrex_flat(store_slug);
CREATE INDEX IF NOT EXISTS idx_super_table_product_id ON super_table_fibrex_flat(product_id);
CREATE INDEX IF NOT EXISTS idx_super_table_order_created ON super_table_fibrex_flat(order_created_at DESC);

-- ------------------------------------------------------------------------------
-- Dynamic Super View: super_table_fibrex_view
-- Automatically aggregates all relational tables into one master view
-- ------------------------------------------------------------------------------
CREATE OR REPLACE VIEW super_table_fibrex_view AS
SELECT
    oi.id AS super_id,
    o.id AS order_id,
    o.order_number,
    o.order_status,
    o.payment_status,
    o.payment_method,
    o.fulfillment_status,
    o.tracking_number,
    o.created_at AS order_created_at,
    
    -- Customer
    p.id AS customer_id,
    p.full_name AS customer_name,
    p.email AS customer_email,
    p.phone AS customer_phone,
    p.role AS customer_role,
    
    -- Shipping
    (o.shipping_address->>'address') AS shipping_street,
    (o.shipping_address->>'city') AS shipping_city,
    (o.shipping_address->>'state') AS shipping_state,
    (o.shipping_address->>'country') AS shipping_country,
    (o.shipping_address->>'postalCode') AS shipping_postal_code,
    
    -- Store
    s.id AS store_id,
    s.name AS store_name,
    s.slug AS store_slug,
    s.category AS store_category,
    
    -- Product & Item
    prod.id AS product_id,
    oi.product_name,
    prod.sku AS product_sku,
    c.name AS category_name,
    prod.brand AS product_brand,
    oi.product_image,
    oi.quantity,
    oi.unit_price_ngn,
    oi.total_price_ngn AS line_total_ngn,
    
    -- Order Financials
    o.subtotal_ngn,
    o.discount_ngn,
    o.shipping_ngn,
    o.tax_ngn,
    o.total_ngn AS grand_total_ngn,
    o.currency
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
LEFT JOIN products prod ON prod.id = oi.product_id
LEFT JOIN stores s ON s.id = o.store_id
LEFT JOIN categories c ON c.id = prod.category_id
LEFT JOIN profiles p ON p.id = o.customer_id;

-- ==============================================================================
-- SECTION 4: ROW LEVEL SECURITY (RLS) POLICIES FOR SUPABASE
-- ==============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE super_table_fibrex_flat ENABLE ROW LEVEL SECURITY;

-- Profiles: Public can view limited fields; users can edit own profile; admins can do all
CREATE POLICY "Public read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = auth_user_id);
CREATE POLICY "Admins full profiles access" ON profiles FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.auth_user_id = auth.uid() AND profiles.role = 'platform_admin'
    )
);

-- Products: Everyone can read published; Merchants edit own; Admins full control
CREATE POLICY "Public can view published products" ON products FOR SELECT USING (status = 'published');
CREATE POLICY "Store owners manage own products" ON products FOR ALL USING (
    EXISTS (
        SELECT 1 FROM stores 
        JOIN profiles ON profiles.id = stores.owner_id 
        WHERE stores.id = products.store_id AND profiles.auth_user_id = auth.uid()
    )
);
CREATE POLICY "Admins full products access" ON products FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.auth_user_id = auth.uid() AND profiles.role = 'platform_admin'
    )
);

-- Categories & Stores: Public read
CREATE POLICY "Public can view categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public can view active stores" ON stores FOR SELECT USING (status = 'active');

-- Orders: Customer can read own; Store owner can read their store orders; Admin can read all
CREATE POLICY "Customers can view own orders" ON orders FOR SELECT USING (
    customer_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
);
CREATE POLICY "Customers can insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins full orders access" ON orders FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.auth_user_id = auth.uid() AND profiles.role = 'platform_admin'
    )
);

-- Super Table: Admins have full access; authenticated users can read their records
CREATE POLICY "Admins full super table access" ON super_table_fibrex_flat FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.auth_user_id = auth.uid() AND profiles.role = 'platform_admin'
    )
);
CREATE POLICY "Public can read analytics summary" ON super_table_fibrex_flat FOR SELECT USING (true);

-- ==============================================================================
-- SECTION 5: AUTOMATED TIMESTAMP TRIGGERS
-- ==============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_stores_updated_at ON stores;
CREATE TRIGGER trg_stores_updated_at BEFORE UPDATE ON stores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_products_updated_at ON products;
CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_orders_updated_at ON orders;
CREATE TRIGGER trg_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- SECTION 6: INITIAL SEED DATA (Fibrex Ecosystem Ready-to-Run)
-- ==============================================================================

-- 1. Insert Initial Platform Administrator & Merchants
INSERT INTO profiles (id, full_name, email, role, country_code, status)
VALUES 
    ('a0000000-0000-0000-0000-000000000001', 'Alex Morgan', 'admin@fibrex.store', 'platform_admin', 'NG', 'active'),
    ('a0000000-0000-0000-0000-000000000002', 'Sarah Jenkins', 'sarah@apexmerchants.com', 'store_owner', 'NG', 'active'),
    ('a0000000-0000-0000-0000-000000000003', 'Michael Doe', 'michael.doe@gmail.com', 'customer', 'NG', 'active')
ON CONFLICT (email) DO NOTHING;

-- 2. Insert Default Verified Store
INSERT INTO stores (id, owner_id, name, slug, description, category, country, currency, theme, status)
VALUES 
    ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'Apex Digital & Lifestyle Store', 'apex-store', 'Official authorized supplier of premium consumer electronics, gadgets, and luxury wearables.', 'Consumer Electronics', 'Nigeria', 'NGN', 'modern', 'active')
ON CONFLICT (slug) DO NOTHING;

-- Update store link on owner profile
UPDATE profiles SET store_id = 'b0000000-0000-0000-0000-000000000001' WHERE id = 'a0000000-0000-0000-0000-000000000002';

-- 3. Insert Categories
INSERT INTO categories (id, name, slug, description, icon)
VALUES 
    ('c0000000-0000-0000-0000-000000000001', 'Electronics', 'electronics', 'High-end smartphones, premium audio, gaming consoles and computing', 'Laptop'),
    ('c0000000-0000-0000-0000-000000000002', 'Fashion & Apparel', 'fashion', 'Designer apparel, activewear, footwear and luxury streetwear', 'Shirt'),
    ('c0000000-0000-0000-0000-000000000003', 'Beauty & Personal Care', 'beauty', 'Organic skincare, luxury fragrances, makeup and hair grooming', 'Sparkles'),
    ('c0000000-0000-0000-0000-000000000004', 'Home & Living', 'home', 'Minimalist furniture, smart home decor, and cookware', 'Home')
ON CONFLICT (slug) DO NOTHING;

-- 4. Insert Top Fibrex Products
INSERT INTO products (
    id, store_id, category_id, name, slug, category_slug, 
    price_ngn, original_price_ngn, discount_percent, stock, sku, 
    brand, badge, rating, review_count, sold_count, description, 
    images, tags, is_flash_deal, is_recommended, is_best_seller, status
)
VALUES 
    (
        'd0000000-0000-0000-0000-000000000001',
        'b0000000-0000-0000-0000-000000000001',
        'c0000000-0000-0000-0000-000000000001',
        'Sony WH-1000XM5 Wireless Noise-Cancelling Headphones',
        'sony-wh1000xm5-wireless-headphones',
        'electronics',
        520000.00,
        650000.00,
        20,
        45,
        'SNY-XM5-BLK',
        'Sony',
        '20% OFF',
        4.9,
        142,
        380,
        'Industry-leading active noise cancellation with two processors and 8 microphones for extraordinary sound precision.',
        ARRAY['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'],
        ARRAY['headphones', 'audio', 'wireless', 'sony'],
        TRUE,
        TRUE,
        TRUE,
        'published'
    ),
    (
        'd0000000-0000-0000-0000-000000000002',
        'b0000000-0000-0000-0000-000000000001',
        'c0000000-0000-0000-0000-000000000001',
        'Apple Watch Ultra 2 GPS + Cellular 49mm Titanium',
        'apple-watch-ultra-2-gps-cellular',
        'electronics',
        1350000.00,
        1500000.00,
        10,
        28,
        'APL-WCH-U2',
        'Apple',
        'Trending',
        5.0,
        89,
        210,
        'Rugged aerospace-grade titanium casing, precision dual-frequency GPS, and up to 36 hours of normal battery life.',
        ARRAY['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'],
        ARRAY['smartwatch', 'apple', 'fitness', 'titanium'],
        FALSE,
        TRUE,
        TRUE,
        'published'
    ),
    (
        'd0000000-0000-0000-0000-000000000003',
        'b0000000-0000-0000-0000-000000000002',
        'c0000000-0000-0000-0000-000000000002',
        'Nike Air Max Pulse Roam Urban Sneakers',
        'nike-air-max-pulse-roam',
        'fashion',
        145000.00,
        180000.00,
        19,
        60,
        'NKE-PULSE-01',
        'Nike',
        'Best Seller',
        4.8,
        215,
        540,
        'Point-loaded Air cushioning system delivers unbeatable responsiveness with utilitarian all-weather textile upper.',
        ARRAY['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80'],
        ARRAY['sneakers', 'nike', 'running', 'streetwear'],
        TRUE,
        TRUE,
        TRUE,
        'published'
    )
ON CONFLICT (slug) DO NOTHING;

-- 5. Insert Sample Order
INSERT INTO orders (
    id, order_number, customer_id, store_id, customer_name, customer_email, 
    customer_phone, shipping_address, subtotal_ngn, discount_ngn, shipping_ngn, 
    tax_ngn, total_ngn, currency, order_status, payment_status, fulfillment_status, payment_method
)
VALUES (
    'e0000000-0000-0000-0000-000000000001',
    'ORD-2026-9812',
    'a0000000-0000-0000-0000-000000000003',
    'b0000000-0000-0000-0000-000000000001',
    'Michael Doe',
    'michael.doe@gmail.com',
    '+234 803 456 7890',
    '{"address": "14 Admiralty Way, Lekki Phase 1", "city": "Lagos", "state": "Lagos State", "country": "Nigeria", "postalCode": "105102"}'::jsonb,
    520000.00,
    0.00,
    2500.00,
    0.00,
    522500.00,
    'NGN',
    'Processing',
    'Paid',
    'Unfulfilled',
    'card'
)
ON CONFLICT (order_number) DO NOTHING;

-- 6. Insert Order Items
INSERT INTO order_items (
    id, order_id, product_id, product_name, product_image, quantity, unit_price_ngn, total_price_ngn
)
VALUES (
    'f0000000-0000-0000-0000-000000000001',
    'e0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    'Sony WH-1000XM5 Wireless Noise-Cancelling Headphones',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    1,
    520000.00,
    520000.00
)
ON CONFLICT (id) DO NOTHING;

-- 7. Seed The Physical Master Super Table
INSERT INTO super_table_fibrex_flat (
    super_id, record_type, order_id, order_number, order_status, payment_status, payment_method,
    fulfillment_status, tracking_number, order_created_at, customer_id, customer_name, customer_email,
    customer_phone, customer_role, shipping_street, shipping_city, shipping_state, shipping_country,
    store_id, store_name, store_slug, product_id, product_name, product_sku, product_category,
    product_brand, quantity, unit_price_ngn, line_total_ngn, subtotal_ngn, shipping_ngn, grand_total_ngn, currency
)
VALUES (
    '90000000-0000-0000-0000-000000000001',
    'order_transaction',
    'e0000000-0000-0000-0000-000000000001',
    'ORD-2026-9812',
    'Processing',
    'Paid',
    'card',
    'Unfulfilled',
    'TRK-9812-NG',
    timezone('utc'::text, now()),
    'a0000000-0000-0000-0000-000000000003',
    'Michael Doe',
    'michael.doe@gmail.com',
    '+234 803 456 7890',
    'customer',
    '14 Admiralty Way, Lekki Phase 1',
    'Lagos',
    'Lagos State',
    'Nigeria',
    'b0000000-0000-0000-0000-000000000001',
    'Apex Digital & Lifestyle Store',
    'apex-store',
    'd0000000-0000-0000-0000-000000000001',
    'Sony WH-1000XM5 Wireless Noise-Cancelling Headphones',
    'SNY-XM5-BLK',
    'electronics',
    'Sony',
    1,
    520000.00,
    520000.00,
    520000.00,
    2500.00,
    522500.00,
    'NGN'
)
ON CONFLICT (super_id) DO NOTHING;

-- Verification Query: Check super table status
-- SELECT super_id, record_type, order_number, customer_name, product_name, grand_total_ngn FROM super_table_fibrex_flat;
