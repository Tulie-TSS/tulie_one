-- Adding 2-tier security column for financial documents
ALTER TABLE projects ADD COLUMN IF NOT EXISTS financial_password_hash text;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS financial_password_hash text;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS financial_password_hash text;
