-- ============================================
-- 001: Initial Schema
-- Core tables: profiles, agents, threads, messages, tasks
-- ============================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMs
-- ============================================

CREATE TYPE agent_role AS ENUM (
  'developer', 'marketing', 'admin', 'sales', 'support', 'analyst', 'custom'
);

CREATE TYPE agent_status AS ENUM ('active', 'inactive', 'training');
CREATE TYPE thread_source AS ENUM ('web', 'telegram');
CREATE TYPE thread_status AS ENUM ('active', 'completed', 'archived');
CREATE TYPE message_role AS ENUM ('user', 'assistant', 'system');
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'failed', 'cancelled');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- ============================================
-- profiles
-- ============================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  company_name TEXT,
  avatar_url TEXT,
  telegram_user_id BIGINT UNIQUE,
  telegram_username TEXT,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- agents
-- ============================================

CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role agent_role NOT NULL,
  description TEXT,
  avatar_url TEXT,
  system_prompt TEXT NOT NULL,
  model TEXT DEFAULT 'gpt-4o',
  temperature DECIMAL(2,1) DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 1000,
  tools JSONB DEFAULT '[]',
  knowledge_base_ids UUID[] DEFAULT '{}',
  status agent_status DEFAULT 'active',
  total_tasks INTEGER DEFAULT 0,
  successful_tasks INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_agents_user_id ON agents(user_id);
CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_agents_role ON agents(role);

-- ============================================
-- threads
-- ============================================

CREATE TABLE threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  title TEXT,
  source thread_source NOT NULL,
  status thread_status DEFAULT 'active',
  telegram_chat_id BIGINT,
  message_count INTEGER DEFAULT 0,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_threads_user_id ON threads(user_id);
CREATE INDEX idx_threads_agent_id ON threads(agent_id);
CREATE INDEX idx_threads_telegram_chat_id ON threads(telegram_chat_id);
CREATE INDEX idx_threads_last_message ON threads(last_message_at DESC);

-- ============================================
-- messages
-- ============================================

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  role message_role NOT NULL,
  content TEXT NOT NULL,
  reasoning TEXT,
  tool_calls JSONB,
  telegram_message_id INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_thread_id ON messages(thread_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- ============================================
-- tasks
-- ============================================

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  thread_id UUID REFERENCES threads(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority task_priority DEFAULT 'medium',
  status task_status DEFAULT 'pending',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  result JSONB,
  error_message TEXT,
  estimated_duration INTEGER,
  actual_duration INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_agent_id ON tasks(agent_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);

-- ============================================
-- Trigger: auto-update thread stats on new message
-- ============================================

CREATE OR REPLACE FUNCTION update_thread_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE threads
  SET
    message_count = message_count + 1,
    last_message_at = NEW.created_at,
    updated_at = NOW()
  WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_thread_stats
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_thread_stats();
