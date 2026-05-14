-- Migration: Allow freelance_contract type in contract_documents
ALTER TABLE contract_documents DROP CONSTRAINT IF EXISTS contract_documents_type_check;
ALTER TABLE contract_documents ADD CONSTRAINT contract_documents_type_check 
CHECK (type IN ('contract', 'order', 'payment_request', 'delivery_minutes', 'freelance_contract'));
