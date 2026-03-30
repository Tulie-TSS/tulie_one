-- ============================================
-- MIGRATION: Add Partner Registrations
-- Date: 2026-03-31
-- Description:
--   1. Create partner_registrations table for CTV applications
--   2. Setup RLS policies for anon insert and admin full access
--   3. Update storage bucket to allow PDF uploads
-- ============================================

CREATE TABLE IF NOT EXISTS partner_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Thông tin cá nhân
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,

  -- Thông tin CCCD
  id_card_type TEXT DEFAULT 'images'
    CHECK (id_card_type IN ('images', 'pdf')),
  id_card_front_url TEXT,          -- Ảnh mặt trước CCCD
  id_card_back_url TEXT,           -- Ảnh mặt sau CCCD
  id_card_pdf_url TEXT,            -- Hoặc file PDF scan cả 2 mặt

  -- Thông tin ngân hàng
  bank_account_number TEXT,
  bank_account_name TEXT,          -- Tên chủ tài khoản
  bank_name TEXT,                  -- Tên ngân hàng

  -- Vai trò mong muốn
  preferred_role TEXT DEFAULT 'lead_only'
    CHECK (preferred_role IN ('lead_only', 'consult_close', 'full_close')),

  -- Bổ sung
  experience TEXT,                 -- Kinh nghiệm
  referral_source TEXT,            -- Biết đến qua đâu
  note TEXT,

  -- Quản lý
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  reject_reason TEXT,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Link sau khi approved
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE partner_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_insert_partner_registrations" ON partner_registrations FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "auth_all_partner_registrations" ON partner_registrations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_partner_reg_status ON partner_registrations(status);
CREATE INDEX IF NOT EXISTS idx_partner_reg_created ON partner_registrations(created_at DESC);

-- Allow PDF in id-photos
UPDATE storage.buckets SET allowed_mime_types = 
  ARRAY['image/jpeg','image/png','image/webp','image/heic','image/heif','application/pdf']
WHERE id = 'id-photos';
