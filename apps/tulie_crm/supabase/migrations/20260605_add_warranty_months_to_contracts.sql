-- Migration: Add warranty_months to contracts table
-- Date: 2026-06-05
-- Purpose: Store warranty duration (in months) per contract.
-- Optional field: NULL = no warranty clause, positive integer = warranty months.
-- The contract PDF template renders Điều 9 (warranty clause) only when this is set.

ALTER TABLE contracts
ADD COLUMN IF NOT EXISTS warranty_months integer DEFAULT NULL;

COMMENT ON COLUMN contracts.warranty_months IS 
'Thời gian bảo hành (số tháng). NULL = không có điều khoản bảo hành. Ngày bắt đầu tính từ ngày bàn giao (end_date).';
