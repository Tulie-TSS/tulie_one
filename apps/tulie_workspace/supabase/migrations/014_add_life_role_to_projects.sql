-- ============================================
-- Migration 014: Add life_role_id to projects
-- Tulie Workspace — Link projects to Life Roles
-- ============================================

ALTER TABLE projects ADD COLUMN IF NOT EXISTS life_role_id UUID REFERENCES life_roles(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_projects_life_role ON projects(life_role_id) WHERE life_role_id IS NOT NULL;
