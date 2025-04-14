-- ============================================
-- 005: Organizations & RBAC
-- Multi-user workspace with role-based access
-- ============================================

-- ============================================
-- ENUMs
-- ============================================

CREATE TYPE org_role AS ENUM ('owner', 'manager', 'specialist', 'viewer');
CREATE TYPE approval_status AS ENUM ('pending_review', 'approved', 'rejected', 'changes_requested');

-- ============================================
-- organizations
-- ============================================

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- organization_members
-- ============================================

CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role org_role NOT NULL DEFAULT 'specialist',
  invited_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (organization_id, user_id)
);

CREATE INDEX idx_org_members_org_id ON organization_members(organization_id);
CREATE INDEX idx_org_members_user_id ON organization_members(user_id);
CREATE INDEX idx_org_members_role ON organization_members(role);

-- ============================================
-- ALTER profiles: add default org
-- ============================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;

-- ============================================
-- ALTER agents: add org context
-- ============================================

ALTER TABLE agents
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_agents_org_id ON agents(organization_id);

-- ============================================
-- ALTER tasks: add approval workflow columns
-- ============================================

ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS approver_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS approval_status approval_status,
  ADD COLUMN IF NOT EXISTS feedback_note TEXT,
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_tasks_org_id ON tasks(organization_id);
CREATE INDEX IF NOT EXISTS idx_tasks_approver ON tasks(approver_id);
CREATE INDEX IF NOT EXISTS idx_tasks_approval_status ON tasks(approval_status);

-- ============================================
-- ALTER memories: add org context
-- ============================================

ALTER TABLE memories
  ADD CONSTRAINT fk_memories_org FOREIGN KEY (organization_id)
    REFERENCES organizations(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_memories_org_id ON memories(organization_id);

-- ============================================
-- Helper: get user's role within their org
-- ============================================

CREATE OR REPLACE FUNCTION get_user_org_role(p_user_id UUID)
RETURNS TABLE (
  organization_id UUID,
  organization_name TEXT,
  role org_role
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    o.id AS organization_id,
    o.name AS organization_name,
    om.role
  FROM organization_members om
  JOIN organizations o ON o.id = om.organization_id
  WHERE om.user_id = p_user_id
  LIMIT 1;
END;
$$;

-- ============================================
-- Trigger: auto-set org_id on task creation
-- ============================================

CREATE OR REPLACE FUNCTION set_task_org_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.organization_id IS NULL THEN
    SELECT p.organization_id INTO NEW.organization_id
    FROM profiles p
    WHERE p.id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_task_org_id
  BEFORE INSERT ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION set_task_org_id();
