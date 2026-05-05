-- Support for Freelance Contracts
ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS category text DEFAULT 'customer' CHECK (category IN ('customer', 'freelancer')),
ADD COLUMN IF NOT EXISTS freelancer_metadata jsonb DEFAULT '{}';

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
