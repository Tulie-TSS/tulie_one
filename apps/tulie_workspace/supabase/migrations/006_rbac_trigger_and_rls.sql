-- Migration: Auto-create user_profiles on auth.users insert
-- Run this on your Supabase SQL Editor

-- 1. Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id UUID;
  v_role TEXT;
  v_full_name TEXT;
BEGIN
  -- Get the first organization (or create a default)
  SELECT id INTO v_org_id FROM organizations LIMIT 1;

  -- Extract metadata
  v_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1)
  );
  v_role := COALESCE(
    NEW.raw_user_meta_data->>'role_type',
    'maker'
  );

  -- Insert into user_profiles
  INSERT INTO public.user_profiles (
    id,
    email,
    full_name,
    role_type,
    organization_id,
    is_active,
    personal_wip_limit,
    hofstadter_multiplier,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    v_full_name,
    v_role::user_role,
    v_org_id,
    true,
    CASE WHEN v_role = 'maker' THEN 2 ELSE 3 END,
    1.30,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- 2. Trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_user();

-- 3. RLS Policies for user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
DROP POLICY IF EXISTS "Users can read own profile" ON public.user_profiles;
CREATE POLICY "Users can read own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Users in same org can read each other (for team page)
DROP POLICY IF EXISTS "Org members can read profiles" ON public.user_profiles;
CREATE POLICY "Org members can read profiles"
  ON public.user_profiles FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.user_profiles WHERE id = auth.uid()
    )
  );

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admin/Manager can update any profile in their org
DROP POLICY IF EXISTS "Managers can update team profiles" ON public.user_profiles;
CREATE POLICY "Managers can update team profiles"
  ON public.user_profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND role_type IN ('admin', 'manager')
      AND organization_id = public.user_profiles.organization_id
    )
  );

-- 4. RLS for tasks
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org members can read tasks" ON public.tasks;
CREATE POLICY "Org members can read tasks"
  ON public.tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      JOIN public.user_profiles u ON u.organization_id = p.organization_id
      WHERE p.id = tasks.project_id AND u.id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Makers can update assigned tasks" ON public.tasks;
CREATE POLICY "Makers can update assigned tasks"
  ON public.tasks FOR UPDATE
  USING (
    assigned_to = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role_type IN ('admin', 'manager')
    )
  );

DROP POLICY IF EXISTS "Managers can insert tasks" ON public.tasks;
CREATE POLICY "Managers can insert tasks"
  ON public.tasks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role_type IN ('admin', 'manager')
    )
  );

DROP POLICY IF EXISTS "Admins can delete tasks" ON public.tasks;
CREATE POLICY "Admins can delete tasks"
  ON public.tasks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role_type IN ('admin', 'manager')
    )
  );
