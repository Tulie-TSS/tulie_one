-- Migration: Update quantity column to NUMERIC in quotation_items & retail_order_items
-- Allows decimal/fractional quantities (e.g. 8.64 m2 for backdrop)

ALTER TABLE IF EXISTS public.quotation_items 
    ALTER COLUMN quantity TYPE NUMERIC(12, 4) USING quantity::NUMERIC;

ALTER TABLE IF EXISTS public.retail_order_items 
    ALTER COLUMN quantity TYPE NUMERIC(12, 4) USING quantity::NUMERIC;
