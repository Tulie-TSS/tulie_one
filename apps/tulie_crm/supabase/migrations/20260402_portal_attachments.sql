-- Add attachments column to quote_portals table
ALTER TABLE quote_portals ADD COLUMN IF NOT EXISTS attachments jsonb DEFAULT '[]'::jsonb;
