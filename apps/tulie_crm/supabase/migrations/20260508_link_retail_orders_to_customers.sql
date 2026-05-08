-- ============================================
-- MIGRATION: Link Retail Orders to Customers
-- Date: 2026-05-08
-- 
-- 1. Add customer_id to retail_orders
-- 2. Create trigger to auto-sync retail orders to customers table
-- 3. Backfill existing orders
-- ============================================

-- 1. Add customer_id column
ALTER TABLE retail_orders ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id) ON DELETE SET NULL;

-- 2. Create trigger function
CREATE OR REPLACE FUNCTION public.sync_retail_order_to_customer()
RETURNS TRIGGER AS $$
DECLARE
    found_customer_id UUID;
    v_created_by UUID;
BEGIN
    -- Only proceed if we have a phone number (main identifier for B2C)
    IF NEW.customer_phone IS NULL OR NEW.customer_phone = '' THEN
        RETURN NEW;
    END IF;

    -- 1. Try to find existing customer by phone
    SELECT id INTO found_customer_id 
    FROM public.customers 
    WHERE phone = NEW.customer_phone 
    LIMIT 1;

    -- 2. If not found, create a new customer record
    IF found_customer_id IS NULL THEN
        -- Use the order creator as the customer creator/assignee if possible
        v_created_by := COALESCE(NEW.created_by, (SELECT id FROM public.users WHERE role = 'admin' LIMIT 1));
        
        INSERT INTO public.customers (
            company_name, 
            phone, 
            email, 
            customer_type, 
            status, 
            address,
            created_by,
            assigned_to
        )
        VALUES (
            NEW.customer_name,
            NEW.customer_phone,
            NEW.customer_email,
            'individual',
            'customer',
            COALESCE(NEW.shipping_info->>'address', NEW.metadata->>'address', ''),
            v_created_by,
            v_created_by
        )
        RETURNING id INTO found_customer_id;
    ELSE
        -- Optionally update existing customer name if it was empty or placeholder
        -- (Safe update: only if company_name is just the phone or generic)
        UPDATE public.customers 
        SET 
            email = COALESCE(email, NEW.customer_email),
            address = COALESCE(address, NEW.shipping_info->>'address', NEW.metadata->>'address', '')
        WHERE id = found_customer_id;
    END IF;

    -- 3. Link the customer to the order
    NEW.customer_id := found_customer_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Attach trigger
DROP TRIGGER IF EXISTS trigger_retail_order_customer_sync ON retail_orders;
CREATE TRIGGER trigger_retail_order_customer_sync
    BEFORE INSERT OR UPDATE OF customer_name, customer_phone, customer_email ON retail_orders
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_retail_order_to_customer();

-- 4. Backfill existing orders
-- This will trigger the "BEFORE" trigger for each row
UPDATE retail_orders SET customer_id = NULL WHERE customer_id IS NULL;
