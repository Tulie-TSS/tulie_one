-- Migration: Add created_by column to invoices table if missing
-- Fixes schema cache error when inserting invoices with created_by field

ALTER TABLE IF EXISTS public.invoices 
    ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.users(id) ON DELETE SET NULL;
