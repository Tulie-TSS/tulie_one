-- Migration: 012_fix_workspace_resources_rls.sql
-- Description: Fix RLS policies for workspace_resources to prevent "new row violates row-level security policy" error
-- Date: 2026-05-09

-- 1. Drop existing policies
DROP POLICY IF EXISTS "Users can view resources of their organization" ON workspace_resources;
DROP POLICY IF EXISTS "Admins, Managers and Makers can manage resources" ON workspace_resources;

-- 2. Create more robust policies
-- SELECT: Users can view resources if they belong to the same organization, or if they are Admins/Managers
CREATE POLICY "Users can view resources of their organization" 
    ON workspace_resources FOR SELECT 
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() 
            AND role_type IN ('admin', 'manager')
        )
        OR (
            organization_id IN (
                SELECT organization_id FROM user_profiles WHERE id = auth.uid()
            )
        )
    );

-- ALL: Admins and Managers can manage ALL resources (org check is handled by their role access)
-- Makers can manage resources within their own organization
CREATE POLICY "Admins and Managers can manage resources" 
    ON workspace_resources FOR ALL 
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() 
            AND role_type IN ('admin', 'manager')
        )
        OR (
            EXISTS (
                SELECT 1 FROM user_profiles
                WHERE id = auth.uid()
                AND organization_id = workspace_resources.organization_id
                AND role_type = 'maker'
            )
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() 
            AND role_type IN ('admin', 'manager')
        )
        OR (
            EXISTS (
                SELECT 1 FROM user_profiles
                WHERE id = auth.uid()
                AND organization_id = workspace_resources.organization_id
                AND role_type = 'maker'
            )
        )
    );
