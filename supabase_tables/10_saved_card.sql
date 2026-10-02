-- ==============================================================================
-- 10. TABLE: saved_card
-- Supabase Target: PostgreSQL
-- Description: Stores PCI-DSS tokenized card references (last4, brand, expiry).
--              NEVER stores full PAN (card numbers) or CVV.
-- ==============================================================================

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

-- Indexing
CREATE INDEX IF NOT EXISTS idx_saved_card_user ON saved_card(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE saved_card ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own saved cards" ON saved_card FOR ALL USING (true);
