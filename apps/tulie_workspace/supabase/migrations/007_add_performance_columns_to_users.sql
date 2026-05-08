-- Migration: Add missing performance columns to user_profiles table
-- Run this in your Supabase SQL Editor to fix the "Could not find the 'hofstadter_multiplier' column" error.

ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS personal_wip_limit INT DEFAULT 2,
ADD COLUMN IF NOT EXISTS hofstadter_multiplier DECIMAL(3,2) DEFAULT 1.30;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';
