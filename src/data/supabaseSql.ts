export interface SeparateTableItem {
  id: string;
  num: number;
  name: string;
  filename: string;
  description: string;
  sql: string;
}

export const SEPARATE_TABLES: SeparateTableItem[] = [
  {
    id: 'profiles',
    num: 1,
    name: '1. profiles',
    filename: '01_profiles.sql',
    description: 'Profiles only table: stores user & admin identity, role, country, and status.',
    sql: `-- 1. TABLE: profiles (Profiles Only)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE,
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

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = auth_user_id);`,
  },
  {
    id: 'store',
    num: 2,
    name: '2. store',
    filename: '02_store.sql',
    description: 'Store table: merchant outlets, brand profiles, themes, and regional currency.',
    sql: `-- 2. TABLE: store
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

CREATE INDEX IF NOT EXISTS idx_store_slug ON store(slug);
CREATE INDEX IF NOT EXISTS idx_store_owner ON store(owner_id);
ALTER TABLE store ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active stores" ON store FOR SELECT USING (status = 'active');`,
  },
  {
    id: 'category',
    num: 3,
    name: '3. category',
    filename: '03_category.sql',
    description: 'Category table: catalog taxonomy categories, icons, and hierarchy.',
    sql: `-- 3. TABLE: category
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

CREATE INDEX IF NOT EXISTS idx_category_slug ON category(slug);
ALTER TABLE category ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read categories" ON category FOR SELECT USING (true);`,
  },
  {
    id: 'product',
    num: 4,
    name: '4. product',
    filename: '04_product.sql',
    description: 'Product table: e-commerce merchandise, stock, pricing, and ratings.',
    sql: `-- 4. TABLE: product
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

CREATE INDEX IF NOT EXISTS idx_product_slug ON product(slug);
CREATE INDEX IF NOT EXISTS idx_product_store ON product(store_id);
CREATE INDEX IF NOT EXISTS idx_product_category ON product(category_id);
CREATE INDEX IF NOT EXISTS idx_product_status ON product(status);
ALTER TABLE product ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published products" ON product FOR SELECT USING (status = 'published');`,
  },
  {
    id: 'order',
    num: 5,
    name: '5. order',
    filename: '05_order.sql',
    description: 'Order table: customer checkout transactions, payment statuses, and shipping addresses.',
    sql: `-- 5. TABLE: order ("orders")
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

CREATE INDEX IF NOT EXISTS idx_order_number ON "order"(order_number);
CREATE INDEX IF NOT EXISTS idx_order_customer ON "order"(customer_id);
ALTER TABLE "order" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers view own orders" ON "order" FOR SELECT USING (true);
CREATE POLICY "Customers create orders" ON "order" FOR INSERT WITH CHECK (true);`,
  },
  {
    id: 'order_items',
    num: 6,
    name: '6. order items',
    filename: '06_order_items.sql',
    description: 'Order items table: individual items inside an order.',
    sql: `-- 6. TABLE: order_items
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

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read order items" ON order_items FOR SELECT USING (true);`,
  },
  {
    id: 'reviews',
    num: 7,
    name: '7. reviews',
    filename: '07_reviews.sql',
    description: 'Reviews table: user product feedback and star ratings.',
    sql: `-- 7. TABLE: reviews
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES product(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    author_name TEXT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT NOT NULL,
    verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read reviews" ON reviews FOR SELECT USING (true);`,
  },
  {
    id: 'wish_list',
    num: 8,
    name: '8. wish list',
    filename: '08_wish_list.sql',
    description: 'Wish list table: customer saved and favorited products.',
    sql: `-- 8. TABLE: wish_list
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS wish_list (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES product(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_wish_list_user ON wish_list(user_id);
ALTER TABLE wish_list ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own wish list" ON wish_list FOR ALL USING (true);`,
  },
  {
    id: 'card_items',
    num: 9,
    name: '9. card items',
    filename: '09_card_items.sql',
    description: 'Card items (shopping cart items) table: active user checkout items.',
    sql: `-- 9. TABLE: card_items (Shopping Cart Items)
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

CREATE INDEX IF NOT EXISTS idx_card_items_user ON card_items(user_id);
ALTER TABLE card_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own card items" ON card_items FOR ALL USING (true);`,
  },
  {
    id: 'saved_card',
    num: 10,
    name: '10. saved card',
    filename: '10_saved_card.sql',
    description: 'Saved card table: PCI-DSS compliant tokenized cards.',
    sql: `-- 10. TABLE: saved_card (Tokenized Payment Cards)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS saved_card (
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

CREATE INDEX IF NOT EXISTS idx_saved_card_user ON saved_card(user_id);
ALTER TABLE saved_card ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own saved cards" ON saved_card FOR ALL USING (true);`,
  },
  {
    id: 'super_table_fibrex_view',
    num: 11,
    name: '11. super table fibrex view',
    filename: '11_super_table_fibrex_view.sql',
    description: 'Super table fibrex view: unified view aggregating orders, items, products, stores, and profiles.',
    sql: `-- 11. TABLE / VIEW: super_table_fibrex_view
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
    p.id AS customer_id,
    p.full_name AS customer_name,
    p.email AS customer_email,
    p.phone AS customer_phone,
    p.role AS customer_role,
    (o.shipping_address->>'address') AS shipping_street,
    (o.shipping_address->>'city') AS shipping_city,
    (o.shipping_address->>'state') AS shipping_state,
    (o.shipping_address->>'country') AS shipping_country,
    s.id AS store_id,
    s.name AS store_name,
    s.slug AS store_slug,
    prod.id AS product_id,
    oi.product_name,
    prod.sku AS product_sku,
    c.name AS category_name,
    prod.brand AS product_brand,
    oi.product_image,
    oi.quantity,
    oi.unit_price_ngn,
    oi.total_price_ngn AS line_total_ngn,
    o.total_ngn AS grand_total_ngn,
    o.currency
FROM order_items oi
JOIN "order" o ON o.id = oi.order_id
LEFT JOIN product prod ON prod.id = oi.product_id
LEFT JOIN store s ON s.id = o.store_id
LEFT JOIN category c ON c.id = prod.category_id
LEFT JOIN profiles p ON p.id = o.customer_id;`,
  },
];
