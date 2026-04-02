-- Thêm cột is_default cho quote_portal_items
ALTER TABLE quote_portal_items ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT false;
