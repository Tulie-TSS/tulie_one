-- ============================================
-- 006: Organization-Aware RLS Policies
-- Replaces user-only policies with org-scoped
-- ============================================

-- ============================================
-- Helper: check if user is owner/manager
-- ============================================

CREATE OR REPLACE FUNCTION is_org_admin(p_user_id UUID, p_org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM organization_members
    WHERE user_id = p_user_id
      AND organization_id = p_org_id
      AND role IN ('owner', 'manager')
  );
$$;

CREATE OR REPLACE FUNCTION user_org_id(p_user_id UUID)
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT organization_id FROM profiles WHERE id = p_user_id LIMIT 1;
$$;

-- ============================================
-- organizations: owners can manage
-- ============================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view their org"
  ON organizations FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = organizations.id
        AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can update org"
  ON organizations FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = organizations.id
        AND organization_members.user_id = auth.uid()
        AND organization_members.role = 'owner'
    )
  );

-- ============================================
-- organization_members
-- ============================================

ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view org roster"
  ON organization_members FOR SELECT USING (
    organization_id IN (
      SELECT om.organization_id FROM organization_members om
      WHERE om.user_id = auth.uid()
    )
  );

CREATE POLICY "Owner can manage members"
  ON organization_members FOR ALL USING (
    is_org_admin(auth.uid(), organization_id)
  );

-- ============================================
-- agents: org-scoped
-- Drop old policies, create new
-- ============================================

DROP POLICY IF EXISTS "Users can view own agents" ON agents;
DROP POLICY IF EXISTS "Users can create own agents" ON agents;
DROP POLICY IF EXISTS "Users can update own agents" ON agents;
DROP POLICY IF EXISTS "Users can delete own agents" ON agents;

-- Owner/manager: see all org agents; specialist/viewer: own only
CREATE POLICY "Org members can view agents"
  ON agents FOR SELECT USING (
    user_id = auth.uid()
    OR (
      organization_id IS NOT NULL
      AND is_org_admin(auth.uid(), organization_id)
    )
  );

CREATE POLICY "Users can create agents"
  ON agents FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own agents"
  ON agents FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own agents"
  ON agents FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- tasks: org-scoped with approval awareness
-- Drop old policies, create new
-- ============================================

DROP POLICY IF EXISTS "Users can view own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can create tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update own tasks" ON tasks;

-- Owner/manager: see all org tasks; specialist: own only
CREATE POLICY "Org members can view tasks"
  ON tasks FOR SELECT USING (
    user_id = auth.uid()
    OR approver_id = auth.uid()
    OR (
      organization_id IS NOT NULL
      AND is_org_admin(auth.uid(), organization_id)
    )
  );

CREATE POLICY "Users can create tasks"
  ON tasks FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Owner/manager can update any org task; specialist can update own
CREATE POLICY "Users can update tasks"
  ON tasks FOR UPDATE USING (
    user_id = auth.uid()
    OR approver_id = auth.uid()
    OR (
      organization_id IS NOT NULL
      AND is_org_admin(auth.uid(), organization_id)
    )
  );

-- ============================================
-- memories: org-scoped + access_level
-- ============================================

ALTER TABLE memories ENABLE ROW LEVEL SECURITY;

-- Owner/manager: all org memories
-- Specialist: own + public org memories
CREATE POLICY "Users can view memories"
  ON memories FOR SELECT USING (
    user_id = auth.uid()
    OR (
      organization_id IS NOT NULL
      AND organization_id = user_org_id(auth.uid())
      AND (
        is_org_admin(auth.uid(), organization_id)
        OR access_level = 'public'
      )
    )
  );

CREATE POLICY "Users can create memories"
  ON memories FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own memories"
  ON memories FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- threads: keep user-scoped (already correct)
-- messages: keep thread-scoped (already correct)
-- documents: keep user-scoped (already correct)
-- profiles: keep self-scoped (already correct)
-- ============================================
