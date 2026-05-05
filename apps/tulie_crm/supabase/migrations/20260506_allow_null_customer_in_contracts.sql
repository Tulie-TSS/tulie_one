-- Allow customer_id to be NULL for freelancer contracts
ALTER TABLE public.contracts ALTER COLUMN customer_id DROP NOT NULL;

-- Ensure data integrity: customer_id is required ONLY if category is 'customer'
ALTER TABLE public.contracts 
ADD CONSTRAINT check_contract_customer_or_freelancer 
CHECK (
  (category = 'customer' AND customer_id IS NOT NULL) OR 
  (category = 'freelancer')
);

NOTIFY pgrst, 'reload schema';
