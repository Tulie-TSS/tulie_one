-- ============================================================
-- QUOTE PORTALS — Kiến trúc portal báo giá
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Portal chính
CREATE TABLE IF NOT EXISTS quote_portals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  customer_id UUID REFERENCES customers(id),
  deal_id UUID,
  project_id UUID,
  public_token TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  brand TEXT DEFAULT 'tulie_agency',
  created_by UUID REFERENCES users(id),
  is_active BOOLEAN DEFAULT true,
  attachments jsonb DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Junction table: portal ↔ quotations (M:N)
CREATE TABLE IF NOT EXISTS quote_portal_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_id UUID REFERENCES quote_portals(id) ON DELETE CASCADE,
  quotation_id UUID REFERENCES quotations(id) ON DELETE CASCADE,
  sort_order INT DEFAULT 0,
  is_recommended BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(portal_id, quotation_id)
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_quote_portals_token ON quote_portals(public_token);
CREATE INDEX IF NOT EXISTS idx_quote_portals_customer ON quote_portals(customer_id);
CREATE INDEX IF NOT EXISTS idx_quote_portals_deal ON quote_portals(deal_id);
CREATE INDEX IF NOT EXISTS idx_quote_portal_items_portal ON quote_portal_items(portal_id);
CREATE INDEX IF NOT EXISTS idx_quote_portal_items_quotation ON quote_portal_items(quotation_id);

-- 4. RLS
ALTER TABLE quote_portals ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_portal_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth users full access portals" ON quote_portals
  FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users full access portal items" ON quote_portal_items
  FOR ALL USING (auth.role() = 'authenticated');

-- Allow anon read for public portal pages
CREATE POLICY "Anon read portals" ON quote_portals
  FOR SELECT USING (true);
CREATE POLICY "Anon read portal items" ON quote_portal_items
  FOR SELECT USING (true);

-- 5. Auto-migrate existing quotation groups into portals
-- This creates a portal for each deal_id that has multiple quotations
INSERT INTO quote_portals (title, customer_id, deal_id, public_token, brand, created_by, is_active)
SELECT 
  'Portal — ' || COALESCE(c.company_name, 'Khách hàng'),
  q.customer_id,
  q.deal_id,
  'p_' || replace(gen_random_uuid()::text, '-', ''),
  q.brand,
  q.created_by,
  true
FROM quotations q
JOIN customers c ON c.id = q.customer_id
WHERE q.deal_id IS NOT NULL
GROUP BY q.deal_id, q.customer_id, q.brand, q.created_by, c.company_name
HAVING COUNT(*) >= 1
ON CONFLICT DO NOTHING;

-- Link existing quotations to their portals
INSERT INTO quote_portal_items (portal_id, quotation_id, sort_order)
SELECT 
  p.id,
  q.id,
  ROW_NUMBER() OVER (PARTITION BY p.id ORDER BY q.created_at ASC) - 1
FROM quotations q
JOIN quote_portals p ON p.deal_id = q.deal_id
ON CONFLICT (portal_id, quotation_id) DO NOTHING;

-- Also create portals for standalone quotations (no deal) that have project_id
INSERT INTO quote_portals (title, customer_id, project_id, public_token, brand, created_by, is_active)
SELECT 
  'Portal — ' || COALESCE(c.company_name, 'Khách hàng'),
  q.customer_id,
  q.project_id,
  'p_' || replace(gen_random_uuid()::text, '-', ''),
  q.brand,
  q.created_by,
  true
FROM quotations q
JOIN customers c ON c.id = q.customer_id
WHERE q.deal_id IS NULL AND q.project_id IS NOT NULL
GROUP BY q.project_id, q.customer_id, q.brand, q.created_by, c.company_name
HAVING COUNT(*) >= 1
ON CONFLICT DO NOTHING;

INSERT INTO quote_portal_items (portal_id, quotation_id, sort_order)
SELECT 
  p.id,
  q.id,
  ROW_NUMBER() OVER (PARTITION BY p.id ORDER BY q.created_at ASC) - 1
FROM quotations q
JOIN quote_portals p ON p.project_id = q.project_id AND p.deal_id IS NULL
WHERE q.deal_id IS NULL AND q.project_id IS NOT NULL
ON CONFLICT (portal_id, quotation_id) DO NOTHING;
