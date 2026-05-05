-- Add new columns for VAT exempt status and custom product name in contract
ALTER TABLE public.quotations 
ADD COLUMN IF NOT EXISTS vat_exempt_status text,
ADD COLUMN IF NOT EXISTS product_name_in_contract text;

ALTER TABLE public.contracts
ADD COLUMN IF NOT EXISTS vat_exempt_status text,
ADD COLUMN IF NOT EXISTS product_name_in_contract text;
