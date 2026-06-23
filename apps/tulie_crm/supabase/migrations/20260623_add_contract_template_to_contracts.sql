-- Migration: Add contract_template to contracts table
-- Date: 2026-06-23
-- Purpose: Store B2B contract template selection: software = Software/Website, design = Design/Production/Printing.

ALTER TABLE contracts
ADD COLUMN IF NOT EXISTS contract_template text DEFAULT 'software';

COMMENT ON COLUMN contracts.contract_template IS 
'Mẫu hợp đồng áp dụng: software = HĐ Phát triển phần mềm/website, design = HĐ Thiết kế, quay chụp, in ấn';
