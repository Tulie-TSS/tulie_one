-- ============================================
-- TULIE ONE: COMPLETE DATABASE MIGRATION
-- Project: zktmaekplppmzqdmglze.supabase.co
-- Date: 2026-04-12
-- 
-- This file combines all schema definitions for the multi-app
-- Supabase setup. Each schema has a clear owner.
--
-- ORDER OF OPERATIONS:
-- 1. Create schemas (workspace, workforce)
-- 2. Create workspace tables
-- 3. Create workforce tables
-- 4. Create triggers and functions
-- 5. Apply RLS policies
-- ============================================

-- ============================================
-- SECTION 1: CREATE SCHEMAS
-- ============================================

CREATE SCHEMA IF NOT EXISTS workspace;
CREATE SCHEMA IF NOT EXISTS workforce;

-- Grant access to Supabase roles
GRANT USAGE ON SCHEMA workspace TO authenticated, anon, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA workspace TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA workspace
  GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA workspace
  GRANT ALL ON SEQUENCES TO service_role;

GRANT USAGE ON SCHEMA workforce TO authenticated, anon, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA workforce TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA workforce
  GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA workforce
  GRANT ALL ON SEQUENCES TO service_role;

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS pg_trgm;


-- ============================================
-- SECTION 2: WORKSPACE SCHEMA (Owner: tulie_workspace)
-- ============================================

-- workspace.projects (linked to CRM projects)
CREATE TABLE IF NOT EXISTS workspace.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crm_project_id UUID,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived', 'on_hold')),
  owner_id UUID,
  task_count INTEGER DEFAULT 0,
  done_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ws_projects_crm ON workspace.projects(crm_project_id);
CREATE INDEX IF NOT EXISTS idx_ws_projects_status ON workspace.projects(status);

-- workspace.cycles
CREATE TABLE IF NOT EXISTS workspace.cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed', 'cancelled')),
  goals JSONB DEFAULT '[]',
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ws_cycles_status ON workspace.cycles(status);
CREATE INDEX IF NOT EXISTS idx_ws_cycles_dates ON workspace.cycles(start_date, end_date);

-- workspace.tags
CREATE TABLE IF NOT EXISTS workspace.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6B7280',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name)
);

-- workspace.tasks
CREATE TABLE IF NOT EXISTS workspace.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crm_project_id UUID,
  crm_work_item_id UUID,
  crm_customer_name TEXT,
  crm_order_code TEXT,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'backlog'
    CHECK (status IN ('backlog', 'ready', 'doing', 'in_review', 'done', 'quarantine', 'cancelled')),
  priority TEXT DEFAULT 'medium'
    CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  eisenhower_quadrant TEXT CHECK (eisenhower_quadrant IN ('Q1', 'Q2', 'Q3', 'Q4')),
  estimated_effort_hours NUMERIC(5,1),
  actual_effort_hours NUMERIC(5,1),
  assigned_to UUID,
  created_by UUID,
  due_date TIMESTAMPTZ,
  start_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  project_id UUID REFERENCES workspace.projects(id) ON DELETE SET NULL,
  cycle_id UUID REFERENCES workspace.cycles(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  category TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ws_tasks_status ON workspace.tasks(status);
CREATE INDEX IF NOT EXISTS idx_ws_tasks_assigned ON workspace.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_ws_tasks_due ON workspace.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_ws_tasks_project ON workspace.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_ws_tasks_cycle ON workspace.tasks(cycle_id);
CREATE INDEX IF NOT EXISTS idx_ws_tasks_crm_project ON workspace.tasks(crm_project_id);
CREATE INDEX IF NOT EXISTS idx_ws_tasks_eisenhower ON workspace.tasks(eisenhower_quadrant);
CREATE INDEX IF NOT EXISTS idx_ws_tasks_priority ON workspace.tasks(priority);

-- workspace.task_tags
CREATE TABLE IF NOT EXISTS workspace.task_tags (
  task_id UUID NOT NULL REFERENCES workspace.tasks(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES workspace.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, tag_id)
);

-- workspace.task_comments
CREATE TABLE IF NOT EXISTS workspace.task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES workspace.tasks(id) ON DELETE CASCADE,
  user_id UUID,
  content TEXT NOT NULL,
  attachments TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ws_comments_task ON workspace.task_comments(task_id);

-- workspace.templates
CREATE TABLE IF NOT EXISTS workspace.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  tasks JSONB DEFAULT '[]',
  category TEXT,
  usage_count INTEGER DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- workspace.notifications
CREATE TABLE IF NOT EXISTS workspace.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
  related_task_id UUID REFERENCES workspace.tasks(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ws_notifications_user ON workspace.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_ws_notifications_unread ON workspace.notifications(user_id, is_read) WHERE is_read = false;


-- ============================================
-- SECTION 3: WORKFORCE SCHEMA (Owner: tulie_workforce)
-- ============================================

-- ENUMs (using DO$$ for idempotent creation)
DO $$ BEGIN
  CREATE TYPE workforce.agent_role AS ENUM ('developer', 'marketing', 'admin', 'sales', 'support', 'analyst', 'custom');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE workforce.agent_status AS ENUM ('active', 'inactive', 'training');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE workforce.thread_source AS ENUM ('web', 'telegram');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE workforce.thread_status AS ENUM ('active', 'completed', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE workforce.message_role AS ENUM ('user', 'assistant', 'system');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE workforce.task_status AS ENUM ('pending', 'in_progress', 'completed', 'failed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE workforce.task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE workforce.document_type AS ENUM ('pdf', 'docx', 'txt', 'markdown', 'url');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE workforce.document_status AS ENUM ('processing', 'ready', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE workforce.memory_type AS ENUM ('fact', 'preference', 'sop', 'reflection');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE workforce.org_role AS ENUM ('owner', 'manager', 'specialist', 'viewer');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE workforce.approval_status AS ENUM ('pending_review', 'approved', 'rejected', 'changes_requested');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- workforce.organizations
CREATE TABLE IF NOT EXISTS workforce.organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- workforce.profiles
CREATE TABLE IF NOT EXISTS workforce.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  crm_user_id UUID,
  organization_id UUID REFERENCES workforce.organizations(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  company_name TEXT,
  avatar_url TEXT,
  telegram_user_id BIGINT UNIQUE,
  telegram_username TEXT,
  timezone TEXT DEFAULT 'Asia/Ho_Chi_Minh',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- workforce.organization_members
CREATE TABLE IF NOT EXISTS workforce.organization_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES workforce.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES workforce.profiles(id) ON DELETE CASCADE,
  role workforce.org_role NOT NULL DEFAULT 'specialist',
  invited_by UUID REFERENCES workforce.profiles(id) ON DELETE SET NULL,
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_wf_org_members_org ON workforce.organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_wf_org_members_user ON workforce.organization_members(user_id);

-- workforce.agents
CREATE TABLE IF NOT EXISTS workforce.agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES workforce.profiles(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES workforce.organizations(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  role workforce.agent_role NOT NULL,
  description TEXT,
  avatar_url TEXT,
  system_prompt TEXT NOT NULL,
  model TEXT DEFAULT 'gpt-4o',
  temperature DECIMAL(2,1) DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 1000,
  tools JSONB DEFAULT '[]',
  knowledge_base_ids UUID[] DEFAULT '{}',
  status workforce.agent_status DEFAULT 'active',
  total_tasks INTEGER DEFAULT 0,
  successful_tasks INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wf_agents_user ON workforce.agents(user_id);
CREATE INDEX IF NOT EXISTS idx_wf_agents_org ON workforce.agents(organization_id);
CREATE INDEX IF NOT EXISTS idx_wf_agents_status ON workforce.agents(status);

-- workforce.threads
CREATE TABLE IF NOT EXISTS workforce.threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES workforce.profiles(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES workforce.agents(id) ON DELETE SET NULL,
  title TEXT,
  source workforce.thread_source NOT NULL,
  status workforce.thread_status DEFAULT 'active',
  telegram_chat_id BIGINT,
  message_count INTEGER DEFAULT 0,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wf_threads_user ON workforce.threads(user_id);
CREATE INDEX IF NOT EXISTS idx_wf_threads_agent ON workforce.threads(agent_id);

-- workforce.messages
CREATE TABLE IF NOT EXISTS workforce.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID NOT NULL REFERENCES workforce.threads(id) ON DELETE CASCADE,
  role workforce.message_role NOT NULL,
  content TEXT NOT NULL,
  reasoning TEXT,
  tool_calls JSONB,
  telegram_message_id INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wf_messages_thread ON workforce.messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_wf_messages_created ON workforce.messages(created_at DESC);

-- workforce.tasks
CREATE TABLE IF NOT EXISTS workforce.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES workforce.profiles(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES workforce.agents(id) ON DELETE SET NULL,
  thread_id UUID REFERENCES workforce.threads(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES workforce.organizations(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority workforce.task_priority DEFAULT 'medium',
  status workforce.task_status DEFAULT 'pending',
  approver_id UUID REFERENCES workforce.profiles(id) ON DELETE SET NULL,
  approval_status workforce.approval_status,
  feedback_note TEXT,
  created_by UUID REFERENCES workforce.profiles(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  result JSONB,
  error_message TEXT,
  estimated_duration INTEGER,
  actual_duration INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wf_tasks_user ON workforce.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_wf_tasks_agent ON workforce.tasks(agent_id);
CREATE INDEX IF NOT EXISTS idx_wf_tasks_status ON workforce.tasks(status);
CREATE INDEX IF NOT EXISTS idx_wf_tasks_org ON workforce.tasks(organization_id);

-- workforce.documents
CREATE TABLE IF NOT EXISTS workforce.documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES workforce.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type workforce.document_type NOT NULL,
  file_url TEXT,
  original_filename TEXT,
  file_size INTEGER,
  content TEXT,
  metadata JSONB DEFAULT '{}',
  status workforce.document_status DEFAULT 'processing',
  error_message TEXT,
  chunk_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wf_documents_user ON workforce.documents(user_id);

-- workforce.document_embeddings
CREATE TABLE IF NOT EXISTS workforce.document_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES workforce.documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES workforce.profiles(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536) NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wf_embeddings_doc ON workforce.document_embeddings(document_id);
CREATE INDEX IF NOT EXISTS idx_wf_embeddings_user ON workforce.document_embeddings(user_id);

-- workforce.memories
CREATE TABLE IF NOT EXISTS workforce.memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES workforce.profiles(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES workforce.agents(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES workforce.organizations(id) ON DELETE SET NULL,
  type workforce.memory_type NOT NULL DEFAULT 'fact',
  content TEXT NOT NULL,
  embedding vector(1536),
  importance FLOAT DEFAULT 0.5 CHECK (importance >= 0 AND importance <= 1),
  access_level TEXT DEFAULT 'private' CHECK (access_level IN ('public', 'private')),
  metadata JSONB DEFAULT '{}',
  source TEXT DEFAULT 'manual' CHECK (source IN ('task', 'manual', 'document', 'reflection')),
  source_ref TEXT,
  access_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wf_memories_user ON workforce.memories(user_id);
CREATE INDEX IF NOT EXISTS idx_wf_memories_agent ON workforce.memories(agent_id);
CREATE INDEX IF NOT EXISTS idx_wf_memories_type ON workforce.memories(type);
CREATE INDEX IF NOT EXISTS idx_wf_memories_importance ON workforce.memories(importance DESC);

-- workforce.agent_alerts
CREATE TABLE IF NOT EXISTS workforce.agent_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alert_type TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  severity TEXT DEFAULT 'warning' CHECK (severity IN ('info', 'warning', 'critical')),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  action_taken TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- workforce.fb_ad_accounts
CREATE TABLE IF NOT EXISTS workforce.fb_ad_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES workforce.organizations(id) ON DELETE CASCADE,
  fb_account_id TEXT NOT NULL UNIQUE,
  fb_account_name TEXT,
  access_token_encrypted TEXT NOT NULL,
  daily_budget_limit NUMERIC(15,2),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'disabled')),
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- workforce.fb_campaigns
CREATE TABLE IF NOT EXISTS workforce.fb_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ad_account_id UUID REFERENCES workforce.fb_ad_accounts(id) ON DELETE CASCADE,
  fb_campaign_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  objective TEXT,
  status TEXT DEFAULT 'ACTIVE',
  daily_budget NUMERIC(15,2),
  lifetime_budget NUMERIC(15,2),
  spend NUMERIC(15,2) DEFAULT 0,
  impressions BIGINT DEFAULT 0,
  clicks BIGINT DEFAULT 0,
  leads_count INTEGER DEFAULT 0,
  cpr NUMERIC(15,2) DEFAULT 0,
  ctr NUMERIC(5,4) DEFAULT 0,
  cpm NUMERIC(15,2) DEFAULT 0,
  cpr_threshold NUMERIC(15,2),
  cpr_alert_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_synced_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_wf_fb_campaigns_account ON workforce.fb_campaigns(ad_account_id);
CREATE INDEX IF NOT EXISTS idx_wf_fb_campaigns_status ON workforce.fb_campaigns(status);

-- workforce.fb_adsets
CREATE TABLE IF NOT EXISTS workforce.fb_adsets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES workforce.fb_campaigns(id) ON DELETE CASCADE,
  fb_adset_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  status TEXT,
  daily_budget NUMERIC(15,2),
  targeting JSONB,
  spend NUMERIC(15,2) DEFAULT 0,
  impressions BIGINT DEFAULT 0,
  clicks BIGINT DEFAULT 0,
  leads_count INTEGER DEFAULT 0,
  cpr NUMERIC(15,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- workforce.fb_ads
CREATE TABLE IF NOT EXISTS workforce.fb_ads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  adset_id UUID REFERENCES workforce.fb_adsets(id) ON DELETE CASCADE,
  fb_ad_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  status TEXT,
  creative_type TEXT,
  creative_url TEXT,
  creative_text TEXT,
  spend NUMERIC(15,2) DEFAULT 0,
  impressions BIGINT DEFAULT 0,
  clicks BIGINT DEFAULT 0,
  leads_count INTEGER DEFAULT 0,
  cpr NUMERIC(15,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- workforce.fb_agent_actions
CREATE TABLE IF NOT EXISTS workforce.fb_agent_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES workforce.agents(id),
  campaign_id UUID REFERENCES workforce.fb_campaigns(id),
  action_type TEXT NOT NULL,
  action_data JSONB NOT NULL DEFAULT '{}',
  reason TEXT,
  status TEXT DEFAULT 'executed' CHECK (status IN ('proposed', 'executed', 'rejected', 'failed')),
  requires_approval BOOLEAN DEFAULT false,
  approved_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- workforce.fb_alerts
CREATE TABLE IF NOT EXISTS workforce.fb_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES workforce.fb_campaigns(id),
  alert_type TEXT NOT NULL,
  severity TEXT DEFAULT 'warning' CHECK (severity IN ('info', 'warning', 'critical')),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  action_taken TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================
-- SECTION 4: TRIGGERS AND FUNCTIONS
-- ============================================

-- Workspace: Auto-update project task counts
CREATE OR REPLACE FUNCTION workspace.update_project_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.project_id IS NOT NULL THEN
    UPDATE workspace.projects SET
      task_count = (SELECT COUNT(*) FROM workspace.tasks WHERE project_id = OLD.project_id),
      done_count = (SELECT COUNT(*) FROM workspace.tasks WHERE project_id = OLD.project_id AND status = 'done')
    WHERE id = OLD.project_id;
  END IF;
  IF NEW.project_id IS NOT NULL THEN
    UPDATE workspace.projects SET
      task_count = (SELECT COUNT(*) FROM workspace.tasks WHERE project_id = NEW.project_id),
      done_count = (SELECT COUNT(*) FROM workspace.tasks WHERE project_id = NEW.project_id AND status = 'done')
    WHERE id = NEW.project_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_ws_task_project_count ON workspace.tasks;
CREATE TRIGGER trigger_ws_task_project_count
  AFTER INSERT OR UPDATE OF status, project_id ON workspace.tasks
  FOR EACH ROW EXECUTE FUNCTION workspace.update_project_counts();

-- Workspace: Auto-update updated_at
CREATE OR REPLACE FUNCTION workspace.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_ws_tasks_updated ON workspace.tasks;
CREATE TRIGGER trigger_ws_tasks_updated
  BEFORE UPDATE ON workspace.tasks
  FOR EACH ROW EXECUTE FUNCTION workspace.set_updated_at();

DROP TRIGGER IF EXISTS trigger_ws_projects_updated ON workspace.projects;
CREATE TRIGGER trigger_ws_projects_updated
  BEFORE UPDATE ON workspace.projects
  FOR EACH ROW EXECUTE FUNCTION workspace.set_updated_at();

DROP TRIGGER IF EXISTS trigger_ws_cycles_updated ON workspace.cycles;
CREATE TRIGGER trigger_ws_cycles_updated
  BEFORE UPDATE ON workspace.cycles
  FOR EACH ROW EXECUTE FUNCTION workspace.set_updated_at();

-- Workspace: CRM project → Workspace project (SOURCE: public, TARGET: workspace)
-- This trigger stays in the workspace schema as it's triggered from public.projects
CREATE OR REPLACE FUNCTION workspace.auto_create_from_crm_project()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO workspace.projects (crm_project_id, name, description)
  VALUES (NEW.id, NEW.title, COALESCE(NEW.description, ''))
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'projects') THEN
    DROP TRIGGER IF EXISTS trigger_crm_project_to_workspace ON public.projects;
    CREATE TRIGGER trigger_crm_project_to_workspace
      AFTER INSERT ON public.projects
      FOR EACH ROW EXECUTE FUNCTION workspace.auto_create_from_crm_project();
  END IF;
END $$;

-- Workspace: Task completion notification
CREATE OR REPLACE FUNCTION workspace.on_task_completed()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'done' AND OLD.status != 'done' THEN
    NEW.completed_at := NOW();
    IF NEW.created_by IS NOT NULL AND NEW.created_by != NEW.assigned_to THEN
      INSERT INTO workspace.notifications (user_id, title, content, type, related_task_id)
      VALUES (NEW.created_by, '✅ Task hoàn thành', NEW.title || ' đã được hoàn thành.', 'success', NEW.id);
    END IF;
  END IF;
  IF NEW.status = 'quarantine' AND OLD.status != 'quarantine' THEN
    IF NEW.created_by IS NOT NULL THEN
      INSERT INTO workspace.notifications (user_id, title, content, type, related_task_id)
      VALUES (NEW.created_by, '⚠️ Task vào quarantine', NEW.title || ' cần được xem xét lại.', 'warning', NEW.id);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_ws_task_completion ON workspace.tasks;
CREATE TRIGGER trigger_ws_task_completion
  BEFORE UPDATE OF status ON workspace.tasks
  FOR EACH ROW EXECUTE FUNCTION workspace.on_task_completed();

-- Workforce: Thread stats auto-update
CREATE OR REPLACE FUNCTION workforce.update_thread_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE workforce.threads
  SET
    message_count = message_count + 1,
    last_message_at = NEW.created_at,
    updated_at = NOW()
  WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_wf_update_thread_stats ON workforce.messages;
CREATE TRIGGER trigger_wf_update_thread_stats
  AFTER INSERT ON workforce.messages
  FOR EACH ROW EXECUTE FUNCTION workforce.update_thread_stats();

-- Workforce: Auto-set org_id on task creation
CREATE OR REPLACE FUNCTION workforce.set_task_org_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.organization_id IS NULL THEN
    SELECT p.organization_id INTO NEW.organization_id
    FROM workforce.profiles p
    WHERE p.id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_wf_set_task_org ON workforce.tasks;
CREATE TRIGGER trigger_wf_set_task_org
  BEFORE INSERT ON workforce.tasks
  FOR EACH ROW EXECUTE FUNCTION workforce.set_task_org_id();

-- Workforce: FB Alert → Workspace notification
CREATE OR REPLACE FUNCTION workforce.on_fb_alert_created()
RETURNS TRIGGER AS $$
DECLARE
  account_owner UUID;
BEGIN
  IF NEW.severity != 'critical' THEN
    RETURN NEW;
  END IF;
  
  SELECT owner_id INTO account_owner
  FROM workforce.fb_ad_accounts
  WHERE id = (
    SELECT account_id FROM workforce.fb_campaigns 
    WHERE id = NEW.campaign_id LIMIT 1
  );
  
  IF account_owner IS NOT NULL THEN
    INSERT INTO workspace.notifications (user_id, title, content, type)
    VALUES (
      account_owner,
      '🚨 FB Ads: ' || NEW.alert_type,
      'Campaign: ' || COALESCE(NEW.campaign_name, '') || ' — ' || NEW.message,
      'error'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_fb_alert_to_workspace ON workforce.fb_alerts;
CREATE TRIGGER trigger_fb_alert_to_workspace
  AFTER INSERT ON workforce.fb_alerts
  FOR EACH ROW EXECUTE FUNCTION workforce.on_fb_alert_created();


-- ============================================
-- SECTION 5: RLS POLICIES - WORKSPACE
-- ============================================

ALTER TABLE workspace.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace.cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace.task_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace.task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace.notifications ENABLE ROW LEVEL SECURITY;

-- Permissive policies for internal use
DROP POLICY IF EXISTS "ws_projects_auth" ON workspace.projects;
CREATE POLICY "ws_projects_auth" ON workspace.projects FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "ws_cycles_auth" ON workspace.cycles;
CREATE POLICY "ws_cycles_auth" ON workspace.cycles FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "ws_tags_auth" ON workspace.tags;
CREATE POLICY "ws_tags_auth" ON workspace.tags FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "ws_tasks_auth" ON workspace.tasks;
CREATE POLICY "ws_tasks_auth" ON workspace.tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "ws_task_tags_auth" ON workspace.task_tags;
CREATE POLICY "ws_task_tags_auth" ON workspace.task_tags FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "ws_comments_auth" ON workspace.task_comments;
CREATE POLICY "ws_comments_auth" ON workspace.task_comments FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "ws_templates_auth" ON workspace.templates;
CREATE POLICY "ws_templates_auth" ON workspace.templates FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "ws_notifications_auth" ON workspace.notifications;
CREATE POLICY "ws_notifications_auth" ON workspace.notifications FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- ============================================
-- SECTION 6: RLS POLICIES - WORKFORCE
-- ============================================

ALTER TABLE workforce.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE workforce.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE workforce.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workforce.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE workforce.threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE workforce.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE workforce.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE workforce.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE workforce.document_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE workforce.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE workforce.fb_ad_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workforce.fb_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE workforce.fb_adsets ENABLE ROW LEVEL SECURITY;
ALTER TABLE workforce.fb_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE workforce.fb_agent_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workforce.fb_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workforce.agent_alerts ENABLE ROW LEVEL SECURITY;

-- Workforce policies
DROP POLICY IF EXISTS "wf_profiles_own" ON workforce.profiles;
CREATE POLICY "wf_profiles_own" ON workforce.profiles FOR ALL USING (auth.uid() = id);

DROP POLICY IF EXISTS "wf_agents_view" ON workforce.agents;
CREATE POLICY "wf_agents_view" ON workforce.agents FOR SELECT USING (
  user_id = auth.uid()
  OR (organization_id IS NOT NULL AND workforce.is_org_admin(auth.uid(), organization_id))
);
DROP POLICY IF EXISTS "wf_agents_create" ON workforce.agents;
CREATE POLICY "wf_agents_create" ON workforce.agents FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "wf_agents_update" ON workforce.agents;
CREATE POLICY "wf_agents_update" ON workforce.agents FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "wf_agents_delete" ON workforce.agents;
CREATE POLICY "wf_agents_delete" ON workforce.agents FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "wf_tasks_view" ON workforce.tasks;
CREATE POLICY "wf_tasks_view" ON workforce.tasks FOR SELECT USING (
  user_id = auth.uid() OR approver_id = auth.uid()
  OR (organization_id IS NOT NULL AND workforce.is_org_admin(auth.uid(), organization_id))
);
DROP POLICY IF EXISTS "wf_tasks_create" ON workforce.tasks;
CREATE POLICY "wf_tasks_create" ON workforce.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "wf_tasks_update" ON workforce.tasks;
CREATE POLICY "wf_tasks_update" ON workforce.tasks FOR UPDATE USING (
  user_id = auth.uid() OR approver_id = auth.uid()
  OR (organization_id IS NOT NULL AND workforce.is_org_admin(auth.uid(), organization_id))
);

DROP POLICY IF EXISTS "wf_threads_own" ON workforce.threads;
CREATE POLICY "wf_threads_own" ON workforce.threads FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS "wf_messages_own" ON workforce.messages;
CREATE POLICY "wf_messages_own" ON workforce.messages FOR ALL USING (
  thread_id IN (SELECT id FROM workforce.threads WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "wf_documents_own" ON workforce.documents;
CREATE POLICY "wf_documents_own" ON workforce.documents FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS "wf_embeddings_own" ON workforce.document_embeddings;
CREATE POLICY "wf_embeddings_own" ON workforce.document_embeddings FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS "wf_memories_view" ON workforce.memories;
CREATE POLICY "wf_memories_view" ON workforce.memories FOR SELECT USING (
  user_id = auth.uid()
  OR (organization_id IS NOT NULL AND (
    workforce.is_org_admin(auth.uid(), organization_id) OR access_level = 'public'
  ))
);
DROP POLICY IF EXISTS "wf_memories_create" ON workforce.memories;
CREATE POLICY "wf_memories_create" ON workforce.memories FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "wf_memories_delete" ON workforce.memories;
CREATE POLICY "wf_memories_delete" ON workforce.memories FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "wf_orgs_view" ON workforce.organizations;
CREATE POLICY "wf_orgs_view" ON workforce.organizations FOR SELECT USING (EXISTS (
  SELECT 1 FROM workforce.organization_members WHERE organization_id = id AND user_id = auth.uid()
));

DROP POLICY IF EXISTS "wf_org_members_view" ON workforce.organization_members;
CREATE POLICY "wf_org_members_view" ON workforce.organization_members FOR SELECT USING (
  organization_id IN (SELECT om.organization_id FROM workforce.organization_members om WHERE om.user_id = auth.uid())
);
DROP POLICY IF EXISTS "wf_org_members_manage" ON workforce.organization_members;
CREATE POLICY "wf_org_members_manage" ON workforce.organization_members FOR ALL USING (workforce.is_org_admin(auth.uid(), organization_id));

DROP POLICY IF EXISTS "wf_fb_accounts_org" ON workforce.fb_ad_accounts;
CREATE POLICY "wf_fb_accounts_org" ON workforce.fb_ad_accounts FOR ALL USING (
  organization_id IN (SELECT om.organization_id FROM workforce.organization_members om WHERE om.user_id = auth.uid())
);

DROP POLICY IF EXISTS "wf_fb_campaigns_org" ON workforce.fb_campaigns;
CREATE POLICY "wf_fb_campaigns_org" ON workforce.fb_campaigns FOR ALL USING (
  ad_account_id IN (
    SELECT id FROM workforce.fb_ad_accounts
    WHERE organization_id IN (SELECT om.organization_id FROM workforce.organization_members om WHERE om.user_id = auth.uid())
  )
);

DROP POLICY IF EXISTS "wf_fb_adsets_org" ON workforce.fb_adsets;
CREATE POLICY "wf_fb_adsets_org" ON workforce.fb_adsets FOR ALL USING (
  campaign_id IN (SELECT id FROM workforce.fb_campaigns WHERE ad_account_id IN (
    SELECT id FROM workforce.fb_ad_accounts
    WHERE organization_id IN (SELECT om.organization_id FROM workforce.organization_members om WHERE om.user_id = auth.uid())
  ))
);

DROP POLICY IF EXISTS "wf_fb_ads_org" ON workforce.fb_ads;
CREATE POLICY "wf_fb_ads_org" ON workforce.fb_ads FOR ALL USING (
  adset_id IN (SELECT id FROM workforce.fb_adsets WHERE campaign_id IN (
    SELECT id FROM workforce.fb_campaigns WHERE ad_account_id IN (
      SELECT id FROM workforce.fb_ad_accounts
      WHERE organization_id IN (SELECT om.organization_id FROM workforce.organization_members om WHERE om.user_id = auth.uid())
    )
  ))
);

DROP POLICY IF EXISTS "wf_fb_actions_view" ON workforce.fb_agent_actions;
CREATE POLICY "wf_fb_actions_view" ON workforce.fb_agent_actions FOR SELECT USING (true);
DROP POLICY IF EXISTS "wf_fb_alerts_view" ON workforce.fb_alerts;
CREATE POLICY "wf_fb_alerts_view" ON workforce.fb_alerts FOR SELECT USING (true);
DROP POLICY IF EXISTS "wf_agent_alerts_view" ON workforce.agent_alerts;
CREATE POLICY "wf_agent_alerts_view" ON workforce.agent_alerts FOR SELECT USING (true);


-- ============================================
-- SECTION 7: HELPER FUNCTIONS
-- ============================================

-- Check org admin
CREATE OR REPLACE FUNCTION workforce.is_org_admin(p_user_id UUID, p_org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM workforce.organization_members
    WHERE user_id = p_user_id
      AND organization_id = p_org_id
      AND role IN ('owner', 'manager')
  );
$$;

-- Get user org role
CREATE OR REPLACE FUNCTION workforce.get_user_org_role(p_user_id UUID)
RETURNS TABLE (organization_id UUID, organization_name TEXT, role workforce.org_role)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT o.id AS organization_id, o.name AS organization_name, om.role
  FROM workforce.organization_members om
  JOIN workforce.organizations o ON o.id = om.organization_id
  WHERE om.user_id = p_user_id
  LIMIT 1;
END;
$$;

-- Search documents
CREATE OR REPLACE FUNCTION workforce.search_documents(
  query_embedding vector(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5,
  filter_user_id UUID DEFAULT NULL
)
RETURNS TABLE (id UUID, document_id UUID, content TEXT, similarity FLOAT)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    de.id,
    de.document_id,
    de.content,
    (1 - (de.embedding <=> query_embedding))::FLOAT AS similarity
  FROM workforce.document_embeddings de
  WHERE
    (filter_user_id IS NULL OR de.user_id = filter_user_id)
    AND (1 - (de.embedding <=> query_embedding)) > match_threshold
  ORDER BY de.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Match memories
CREATE OR REPLACE FUNCTION workforce.match_memories(
  query_embedding vector(1536),
  match_threshold FLOAT DEFAULT 0.65,
  match_count INT DEFAULT 10,
  filter_user_id UUID DEFAULT NULL,
  filter_agent_id UUID DEFAULT NULL,
  filter_org_id UUID DEFAULT NULL
)
RETURNS TABLE (id UUID, user_id UUID, agent_id UUID, type workforce.memory_type, content TEXT, importance FLOAT, access_level TEXT, source TEXT, source_ref TEXT, similarity FLOAT, weighted_score FLOAT)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id, m.user_id, m.agent_id, m.type, m.content, m.importance, m.access_level, m.source, m.source_ref,
    (1 - (m.embedding <=> query_embedding))::FLOAT AS similarity,
    ((1 - (m.embedding <=> query_embedding)) * m.importance *
      CASE WHEN m.type = 'preference' THEN 1.5 ELSE 1.0 END)::FLOAT AS weighted_score
  FROM workforce.memories m
  WHERE
    m.embedding IS NOT NULL
    AND (filter_user_id IS NULL OR m.user_id = filter_user_id)
    AND (filter_agent_id IS NULL OR m.agent_id = filter_agent_id)
    AND (filter_org_id IS NULL OR m.organization_id = filter_org_id)
    AND (1 - (m.embedding <=> query_embedding)) > match_threshold
  ORDER BY weighted_score DESC
  LIMIT match_count;
END;
$$;


-- ============================================
-- SECTION 8: SEED DATA (Workspace)
-- ============================================

INSERT INTO workspace.tags (name, color) VALUES
  ('bug', '#EF4444'),
  ('feature', '#3B82F6'),
  ('improvement', '#8B5CF6'),
  ('urgent', '#F97316'),
  ('design', '#EC4899'),
  ('content', '#14B8A6'),
  ('development', '#6366F1'),
  ('meeting', '#F59E0B'),
  ('review', '#10B981')
ON CONFLICT (name) DO NOTHING;


-- ============================================
-- SECTION 9: POSTGREST CONFIGURATION
-- ============================================

-- Expose schemas to PostgREST API
ALTER ROLE authenticator SET pgrst.db_schemas TO 'public, workspace, workforce';

-- ============================================
-- MIGRATION COMPLETE
-- ============================================