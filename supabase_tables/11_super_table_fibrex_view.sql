-- ==============================================================================
-- 11. TABLE / VIEW: super_table_fibrex_view
-- Supabase Target: PostgreSQL
-- Description: Dynamic unified view joining order items, orders, products,
--              stores, categories, and profiles for instant dashboards & reporting.
-- ==============================================================================

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
    
    -- Customer Information
    p.id AS customer_id,
    p.full_name AS customer_name,
    p.email AS customer_email,
    p.phone AS customer_phone,
    p.role AS customer_role,
    
    -- Shipping Details
    (o.shipping_address->>'address') AS shipping_street,
    (o.shipping_address->>'city') AS shipping_city,
    (o.shipping_address->>'state') AS shipping_state,
    (o.shipping_address->>'country') AS shipping_country,
    (o.shipping_address->>'postalCode') AS shipping_postal_code,
    
    -- Merchant / Store
    s.id AS store_id,
    s.name AS store_name,
    s.slug AS store_slug,
    s.category AS store_category,
    
    -- Product Information
    prod.id AS product_id,
    oi.product_name,
    prod.sku AS product_sku,
    c.name AS category_name,
    prod.brand AS product_brand,
    oi.product_image,
    oi.quantity,
    oi.unit_price_ngn,
    oi.total_price_ngn AS line_total_ngn,
    
    -- Financial Totals
    o.subtotal_ngn,
    o.discount_ngn,
    o.shipping_ngn,
    o.tax_ngn,
    o.total_ngn AS grand_total_ngn,
    o.currency
FROM order_items oi
JOIN "order" o ON o.id = oi.order_id
LEFT JOIN product prod ON prod.id = oi.product_id
LEFT JOIN store s ON s.id = o.store_id
LEFT JOIN category c ON c.id = prod.category_id
LEFT JOIN profiles p ON p.id = o.customer_id;
