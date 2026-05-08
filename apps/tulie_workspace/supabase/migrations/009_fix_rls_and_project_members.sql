-- Migration: 009_fix_rls_and_project_members.sql
-- Description: Implement project_members and robust RLS for projects/tasks
-- Date: 2026-05-09

-- 1. Create project_members table
CREATE TABLE IF NOT EXISTS project_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'member', -- member, lead, observer
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

-- 2. Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
-- tasks already enabled in 006

-- 3. Projects RLS
DROP POLICY IF EXISTS "Org members can read projects" ON projects;
CREATE POLICY "Org members can read projects"
  ON projects FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Owners and Managers can manage projects" ON projects;
CREATE POLICY "Owners and Managers can manage projects"
  ON projects FOR ALL
  USING (
    owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role_type IN ('admin', 'manager')
    )
  );

-- 4. Project Members RLS
DROP POLICY IF EXISTS "Org members can read project members" ON project_members;
CREATE POLICY "Org members can read project members"
  ON project_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN user_profiles u ON u.organization_id = p.organization_id
      WHERE p.id = project_members.project_id AND u.id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Owners can manage project members" ON project_members;
CREATE POLICY "Owners can manage project members"
  ON project_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_members.project_id
      AND (owner_id = auth.uid() OR EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid() AND role_type IN ('admin', 'manager')
      ))
    )
  );

-- 5. Tasks RLS (Improved)
DROP POLICY IF EXISTS "Org members can read tasks" ON tasks;
CREATE POLICY "Org members can read tasks"
  ON tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN user_profiles u ON u.organization_id = p.organization_id
      WHERE p.id = tasks.project_id AND u.id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Project members and managers can manage tasks" ON tasks;
CREATE POLICY "Project members and managers can manage tasks"
  ON tasks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_id = tasks.project_id AND user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM projects
      WHERE id = tasks.project_id AND owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role_type IN ('admin', 'manager')
    )
  );
