-- ============================================
-- MIGRATION: Add Partner (CTV) fields to Deals
-- Date: 2026-03-30
-- Description:
--   1. Add partner_id, partner_role, partner_commission to deals table
--      in order to support the CTV Commission feature.
-- ============================================

ALTER TABLE deals ADD COLUMN IF NOT EXISTS partner_id uuid REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS partner_role text CHECK (partner_role IN ('lead_only', 'consult_close', 'full_close'));
ALTER TABLE deals ADD COLUMN IF NOT EXISTS partner_commission bigint;

-- Add index for fast querying of partner's deals
CREATE INDEX IF NOT EXISTS idx_deals_partner_id ON deals(partner_id);
