-- ============================================
-- Migration 006: Personal Command Center
-- Tulie Workspace — Multi-Role Personal Productivity
-- ============================================

-- ========== ENUMS ==========

DO $$ BEGIN
  CREATE TYPE life_role_type AS ENUM ('fpt_is', 'tulie', 'personal');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE energy_level AS ENUM ('high', 'medium', 'low', 'exhausted');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE time_block_type AS ENUM ('deep_work', 'meeting', 'admin', 'learning', 'exercise', 'family', 'rest');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ========== TABLES ==========

-- Life Roles (vai trò cuộc sống)
CREATE TABLE IF NOT EXISTS life_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role life_role_type NOT NULL,
  display_name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6B7280',
  icon TEXT NOT NULL DEFAULT '📌',
  daily_time_budget_minutes INT DEFAULT 480,
  priority_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Extend tasks table with life_role context
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS life_role_id UUID REFERENCES life_roles(id) ON DELETE SET NULL;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS energy_required energy_level DEFAULT 'medium';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS due_time TIME;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS streak_count INT DEFAULT 0;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS last_completed_date DATE;

-- Daily Plans (kế hoạch ngày)
CREATE TABLE IF NOT EXISTS daily_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_date DATE NOT NULL,
  morning_energy energy_level DEFAULT 'high',
  sleep_hours DECIMAL(3,1),
  sleep_quality INT CHECK (sleep_quality BETWEEN 1 AND 5),
  exercise_done BOOLEAN DEFAULT false,
  exercise_minutes INT DEFAULT 0,
  exercise_type TEXT,
  mood_score INT CHECK (mood_score BETWEEN 1 AND 10),
  notes TEXT,
  total_tasks_planned INT DEFAULT 0,
  total_tasks_completed INT DEFAULT 0,
  completion_rate DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, plan_date)
);

-- Time Blocks (khối thời gian trong ngày)
CREATE TABLE IF NOT EXISTS time_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  daily_plan_id UUID REFERENCES daily_plans(id) ON DELETE CASCADE,
  block_type time_block_type NOT NULL,
  life_role_id UUID REFERENCES life_roles(id) ON DELETE SET NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  title TEXT,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  is_completed BOOLEAN DEFAULT false,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Habits
CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  life_role_id UUID REFERENCES life_roles(id) ON DELETE SET NULL,
  frequency TEXT NOT NULL DEFAULT 'daily',
  target_minutes INT,
  target_count INT,
  icon TEXT DEFAULT '📌',
  color TEXT DEFAULT '#1E88E5',
  streak_current INT DEFAULT 0,
  streak_best INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habit Logs
CREATE TABLE IF NOT EXISTS habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  completed BOOLEAN DEFAULT false,
  value DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(habit_id, log_date)
);

-- Telegram Config
CREATE TABLE IF NOT EXISTS telegram_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  telegram_chat_id BIGINT,
  telegram_username TEXT,
  bot_token TEXT,
  morning_notification_time TIME DEFAULT '07:00',
  afternoon_notification_time TIME DEFAULT '13:00',
  evening_notification_time TIME DEFAULT '21:30',
  dnd_start TIME DEFAULT '22:00',
  dnd_end TIME DEFAULT '06:30',
  ai_enabled BOOLEAN DEFAULT false,
  ai_model TEXT DEFAULT 'gemini',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Telegram Messages Log
CREATE TABLE IF NOT EXISTS telegram_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('incoming', 'outgoing')),
  message_text TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  notification_schedule TEXT CHECK (notification_schedule IN ('morning', 'afternoon', 'evening')),
  telegram_message_id BIGINT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Business KPIs (Tulie)
CREATE TABLE IF NOT EXISTS business_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kpi_month DATE NOT NULL,
  photo_id_orders INT DEFAULT 0,
  photo_id_revenue DECIMAL(15,2) DEFAULT 0,
  design_print_orders INT DEFAULT 0,
  design_print_revenue DECIMAL(15,2) DEFAULT 0,
  website_orders INT DEFAULT 0,
  website_revenue DECIMAL(15,2) DEFAULT 0,
  n8n_workflow_orders INT DEFAULT 0,
  n8n_workflow_revenue DECIMAL(15,2) DEFAULT 0,
  contractor_costs DECIMAL(15,2) DEFAULT 0,
  operating_costs DECIMAL(15,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, kpi_month)
);

-- FPT IS Learning Goals
CREATE TABLE IF NOT EXISTS fpt_learning_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('nghi_dinh', 'nghi_quyet', 'san_pham', 'quy_trinh', 'skill')),
  title TEXT NOT NULL,
  description TEXT,
  source_document TEXT,
  progress_percent INT DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
  target_date DATE,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ========== INDEXES ==========

CREATE INDEX IF NOT EXISTS idx_life_roles_user ON life_roles(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_tasks_life_role ON tasks(life_role_id);
CREATE INDEX IF NOT EXISTS idx_daily_plans_user_date ON daily_plans(user_id, plan_date DESC);
CREATE INDEX IF NOT EXISTS idx_time_blocks_daily ON time_blocks(daily_plan_id);
CREATE INDEX IF NOT EXISTS idx_time_blocks_user_date ON time_blocks(user_id, start_time);
CREATE INDEX IF NOT EXISTS idx_habits_user ON habits(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_habit_logs_date ON habit_logs(habit_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_telegram_messages_user ON telegram_messages(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_business_kpis_month ON business_kpis(user_id, kpi_month DESC);
CREATE INDEX IF NOT EXISTS idx_fpt_learning_user ON fpt_learning_goals(user_id, category);

-- ========== TRIGGERS ==========

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DO $$ BEGIN
  CREATE TRIGGER set_life_roles_updated_at BEFORE UPDATE ON life_roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TRIGGER set_daily_plans_updated_at BEFORE UPDATE ON daily_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TRIGGER set_habits_updated_at BEFORE UPDATE ON habits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TRIGGER set_telegram_config_updated_at BEFORE UPDATE ON telegram_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TRIGGER set_business_kpis_updated_at BEFORE UPDATE ON business_kpis
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TRIGGER set_fpt_learning_updated_at BEFORE UPDATE ON fpt_learning_goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN null;
END $$;
