-- Migration: 000_all_in_one.sql
-- Description: Complete database schema for Tulie Workspace
-- Date: 2026-04-12
-- Note: Combines all migrations into single file for easier deployment

-- ============================================
-- DROP EXISTING (for clean re-run)
-- ============================================

DROP TABLE IF EXISTS content_performance CASCADE;
DROP TABLE IF EXISTS content_calendar CASCADE;
DROP TABLE IF EXISTS marketing_metrics CASCADE;
DROP TABLE IF EXISTS hiring_plans CASCADE;
DROP TABLE IF EXISTS monthly_finance CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS sales_targets CASCADE;
DROP TABLE IF EXISTS deals CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS task_logs CASCADE;
DROP TABLE IF EXISTS task_tags CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS milestones CASCADE;
DROP TABLE IF EXISTS cycles CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

DROP TYPE IF EXISTS eisenhower_quadrant CASCADE;
DROP TYPE IF EXISTS task_status CASCADE;
DROP TYPE IF EXISTS project_priority CASCADE;
DROP TYPE IF EXISTS project_status CASCADE;
DROP TYPE IF EXISTS cycle_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- ============================================
-- ENUM TYPES
-- ============================================

CREATE TYPE user_role AS ENUM ('admin', 'manager', 'maker', 'observer');
CREATE TYPE cycle_status AS ENUM ('planning', 'active', 'review', 'closed');
CREATE TYPE project_status AS ENUM ('planning', 'active', 'on_hold', 'completed', 'archived');
CREATE TYPE project_priority AS ENUM ('critical', 'high', 'medium', 'low');
CREATE TYPE task_status AS ENUM (
    'intake', 'backlog', 'quarantine', 'ready', 
    'doing', 'on_hold', 'in_review', 'done', 'rejected'
);
CREATE TYPE eisenhower_quadrant AS ENUM ('Q1', 'Q2', 'Q3', 'Q4');

-- ============================================
-- ORGANIZATIONS
-- ============================================

CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USER_PROFILES (links to auth.users)
-- ============================================

CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(1000),
    role_type user_role NOT NULL DEFAULT 'maker',
    organization_id UUID REFERENCES organizations(id),
    is_active BOOLEAN DEFAULT true,
    last_seen_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CYCLES (12-week phases)
-- ============================================

CREATE TABLE cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    parent_cycle_id UUID REFERENCES cycles(id) ON DELETE SET NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    buffer_week_start DATE NOT NULL,
    status cycle_status NOT NULL DEFAULT 'planning',
    goals JSONB DEFAULT '[]',
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT chk_cycle_dates CHECK (end_date > start_date),
    CONSTRAINT chk_buffer_date CHECK (buffer_week_start >= end_date)
);

-- ============================================
-- MILESTONES
-- ============================================

CREATE TABLE milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cycle_id UUID NOT NULL REFERENCES cycles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    target_date DATE NOT NULL,
    completion_rate DECIMAL(5,2) DEFAULT 0.00,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PROJECTS
-- ============================================

CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    cycle_id UUID NOT NULL REFERENCES cycles(id) ON DELETE RESTRICT,
    owner_id UUID REFERENCES auth.users(id),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    status project_status NOT NULL DEFAULT 'planning',
    priority project_priority NOT NULL DEFAULT 'medium',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TASKS (Core entity)
-- ============================================

CREATE TABLE tasks (
    id TEXT PRIMARY KEY,
    title VARCHAR(500) NOT NULL CHECK (char_length(title) >= 3),
    description TEXT,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    created_by UUID REFERENCES auth.users(id),
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status task_status NOT NULL DEFAULT 'intake',
    eisenhower_quadrant eisenhower_quadrant,
    estimated_effort_hours DECIMAL(5,2) NOT NULL CHECK (estimated_effort_hours > 0),
    hofstadter_multiplier DECIMAL(3,2) NOT NULL DEFAULT 1.30,
    scheduled_duration_hours DECIMAL(5,2) GENERATED ALWAYS AS (
        estimated_effort_hours * hofstadter_multiplier
    ) STORED,
    requested_deadline TIMESTAMPTZ,
    scheduled_start TIMESTAMPTZ,
    scheduled_end TIMESTAMPTZ,
    actual_start TIMESTAMPTZ,
    actual_end TIMESTAMPTZ,
    priority INT DEFAULT 0,
    cycle_id UUID REFERENCES cycles(id),
    milestone_id UUID REFERENCES milestones(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TAGS
-- ============================================

CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) NOT NULL DEFAULT '#6B7280',
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(organization_id, name)
);

-- ============================================
-- TASK TAGS (Junction)
-- ============================================

CREATE TABLE task_tags (
    task_id TEXT REFERENCES tasks(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, tag_id)
);

-- ============================================
-- TASK LOGS (Audit Trail)
-- ============================================

CREATE TABLE task_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    action VARCHAR(50) NOT NULL,
    from_value VARCHAR(255),
    to_value VARCHAR(255),
    note TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- COMMENTS
-- ============================================

CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    content TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT false,
    parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DEALS (Sales Pipeline)
-- ============================================

CREATE TABLE deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    contact_name VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    stage VARCHAR(50) NOT NULL DEFAULT 'prospecting',
    value DECIMAL(12,2) DEFAULT 0,
    probability INT DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
    expected_close_date DATE,
    actual_close_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TRANSACTIONS (Income/Expense Log)
-- ============================================

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    category VARCHAR(100) NOT NULL,
    description TEXT,
    amount DECIMAL(12,2) NOT NULL,
    payment_method VARCHAR(50),
    reference VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MONTHLY FINANCE (P&L Summary)
-- ============================================

CREATE TABLE monthly_finance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    month DATE NOT NULL,
    revenue DECIMAL(12,2) DEFAULT 0,
    cogs DECIMAL(12,2) DEFAULT 0,
    gross_profit DECIMAL(12,2) GENERATED ALWAYS AS (revenue - cogs) STORED,
    opex DECIMAL(12,2) DEFAULT 0,
    net_profit DECIMAL(12,2) GENERATED ALWAYS AS (revenue - cogs - opex) STORED,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, month)
);

-- ============================================
-- HIRING PLANS
-- ============================================

CREATE TABLE hiring_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    position VARCHAR(255) NOT NULL,
    employment_type VARCHAR(50) NOT NULL DEFAULT 'fulltime',
    target_start_month DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'planning',
    salary_range_min DECIMAL(12,2),
    salary_range_max DECIMAL(12,2),
    priority VARCHAR(20) DEFAULT 'medium',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MARKETING METRICS
-- ============================================

CREATE TABLE marketing_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    channel VARCHAR(50) NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    value DECIMAL(12,2) NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CONTENT CALENDAR
-- ============================================

CREATE TABLE content_calendar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    planned_date DATE NOT NULL,
    content_type VARCHAR(50) NOT NULL,
    topic VARCHAR(255),
    platform VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'planned',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SALES TARGETS
-- ============================================

CREATE TABLE sales_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    month DATE NOT NULL,
    target_revenue DECIMAL(12,2) DEFAULT 0,
    actual_revenue DECIMAL(12,2) DEFAULT 0,
    deals_closed INT DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, month)
);

-- ============================================
-- CONTENT PERFORMANCE
-- ============================================

CREATE TABLE content_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    content_id UUID REFERENCES content_calendar(id) ON DELETE SET NULL,
    platform VARCHAR(50) NOT NULL,
    impressions INT DEFAULT 0,
    clicks INT DEFAULT 0,
    engagement INT DEFAULT 0,
    shares INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_tasks_assignee_status ON tasks(assigned_to, status);
CREATE INDEX idx_tasks_cycle_status ON tasks(cycle_id, status);
CREATE INDEX idx_tasks_project_status ON tasks(project_id, status);
CREATE INDEX idx_tasks_eisenhower ON tasks(eisenhower_quadrant, status);
CREATE INDEX idx_tasks_milestone ON tasks(milestone_id) WHERE milestone_id IS NOT NULL;
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority DESC);

ALTER TABLE tasks ADD COLUMN search_vector tsvector 
    GENERATED ALWAYS AS (
        setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
        setweight(to_tsvector('simple', coalesce(description, '')), 'B')
    ) STORED;
CREATE INDEX idx_tasks_fulltext ON tasks USING GIN(search_vector);

CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_tasks_title_trgm ON tasks USING GIN(title gin_trgm_ops);

CREATE INDEX idx_cycles_org_status ON cycles(organization_id, status);
CREATE INDEX idx_cycles_active ON cycles(organization_id) WHERE status = 'active';

CREATE INDEX idx_projects_cycle ON projects(cycle_id, status);
CREATE INDEX idx_projects_owner ON projects(owner_id);
CREATE INDEX idx_projects_org ON projects(organization_id);

CREATE INDEX idx_comments_task ON comments(task_id, created_at);
CREATE INDEX idx_comments_pinned ON comments(task_id) WHERE is_pinned = true;

CREATE INDEX idx_task_logs_task ON task_logs(task_id, created_at DESC);
CREATE INDEX idx_task_logs_action ON task_logs(action, created_at DESC);

CREATE INDEX idx_deals_org_stage ON deals(organization_id, stage);
CREATE INDEX idx_deals_expected_close ON deals(expected_close_date) WHERE expected_close_date IS NOT NULL;

CREATE INDEX idx_transactions_org_date ON transactions(organization_id, date DESC);
CREATE INDEX idx_transactions_type ON transactions(organization_id, type, date DESC);

CREATE INDEX idx_monthly_finance_org_month ON monthly_finance(organization_id, month DESC);

CREATE INDEX idx_hiring_plans_org_status ON hiring_plans(organization_id, status);
CREATE INDEX idx_hiring_plans_target ON hiring_plans(target_start_month) WHERE status = 'planning';

CREATE INDEX idx_marketing_metrics_org_date ON marketing_metrics(organization_id, date DESC);
CREATE INDEX idx_marketing_metrics_channel ON marketing_metrics(organization_id, channel, date DESC);

CREATE INDEX idx_content_calendar_org_date ON content_calendar(organization_id, planned_date DESC);
CREATE INDEX idx_content_calendar_platform ON content_calendar(organization_id, platform, planned_date DESC);

CREATE INDEX idx_sales_targets_org_month ON sales_targets(organization_id, month DESC);

-- ============================================
-- TRIGGERS & FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ 
DECLARE 
    t TEXT;
BEGIN
    FOR t IN 
        SELECT table_name FROM information_schema.columns 
        WHERE column_name = 'updated_at' 
        AND table_schema = 'public'
    LOOP
        EXECUTE format(
            'CREATE TRIGGER trg_%s_updated_at 
             BEFORE UPDATE ON %I 
             FOR EACH ROW EXECUTE FUNCTION update_updated_at()',
            t, t
        );
    END LOOP;
END $$;

CREATE OR REPLACE FUNCTION log_task_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO task_logs (task_id, user_id, action, from_value, to_value)
        VALUES (
            NEW.id, 
            COALESCE(auth.uid(), NEW.assigned_to, NEW.created_by),
            'status_change', 
            OLD.status::TEXT, 
            NEW.status::TEXT
        );
        
        IF NEW.status = 'doing' AND OLD.status != 'doing' THEN
            NEW.actual_start = NOW();
        END IF;
        
        IF NEW.status = 'done' AND OLD.status != 'done' THEN
            NEW.actual_end = NOW();
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_task_status_change
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION log_task_status_change();

CREATE OR REPLACE FUNCTION classify_eisenhower(
    p_is_urgent BOOLEAN,
    p_is_important BOOLEAN
) RETURNS eisenhower_quadrant AS $$
BEGIN
    IF p_is_urgent AND p_is_important THEN RETURN 'Q1';
    ELSIF NOT p_is_urgent AND p_is_important THEN RETURN 'Q2';
    ELSIF p_is_urgent AND NOT p_is_important THEN RETURN 'Q3';
    ELSE RETURN 'Q4';
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- SEED DATA
-- ============================================

INSERT INTO organizations (id, name, slug) VALUES
    ('a0000000-0000-0000-0000-000000000001', 'Tulie TSS', 'tulie');

INSERT INTO cycles (id, name, organization_id, start_date, end_date, buffer_week_start, status, goals, created_by) VALUES
('c0000000-0000-0000-0000-000000000001', 'Phase 1: Bootstrap', 'a0000000-0000-0000-0000-000000000001', '2026-04-11', '2026-05-31', '2026-06-01', 'active', 
 '[{"title": "Website tulie.agency hoàn thiện (SEO-ready)", "progress": 10}, {"title": "Close 2 deals đầu tiên", "progress": 0}, {"title": "Launch Facebook Ads campaign", "progress": 0}, {"title": "Xây dựng 5 case studies", "progress": 0}]',
 NULL),
('c0000000-0000-0000-0000-000000000002', 'Phase 2: Cashflow', 'a0000000-0000-0000-0000-000000000001', '2026-06-01', '2026-06-30', '2026-07-01', 'planning',
 '[{"title": "Tuyển 2-3 CTV Sales (commission)", "progress": 0}, {"title": "Launch Chatbot subscription — 3 KH", "progress": 0}, {"title": "Revenue > 100tr/tháng", "progress": 0}]',
 NULL),
('c0000000-0000-0000-0000-000000000003', 'Phase 3: Scale', 'a0000000-0000-0000-0000-000000000001', '2026-08-01', '2026-10-31', '2026-11-01', 'planning',
 '[{"title": "Thuê văn phòng chính thức", "progress": 0}, {"title": "Tuyển Designer FTE + Sales FTE", "progress": 0}, {"title": "Revenue > 200tr/tháng", "progress": 0}, {"title": "Launch Tulie One SaaS beta", "progress": 0}]',
 NULL),
('c0000000-0000-0000-0000-000000000004', 'Phase 4: Professionalize', 'a0000000-0000-0000-0000-000000000001', '2026-11-01', '2026-12-31', '2027-01-01', 'planning',
 '[{"title": "Tuyển Frontend Dev + Designer #2", "progress": 0}, {"title": "Revenue > 300tr/tháng", "progress": 0}, {"title": "Recurring revenue > 50tr/tháng", "progress": 0}]',
 NULL);

INSERT INTO milestones (id, cycle_id, name, description, target_date, completion_rate, sort_order) VALUES
('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Sprint 1: Foundation & First Sales', 'Website live, Sales kit, 50 outreach, social media activated', '2026-04-25', 8, 1),
('b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'Sprint 2: Ads Launch & Pipeline', 'FB Ads live, 10+ leads, 2 proposals sent', '2026-05-09', 0, 2),
('b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'Sprint 3: Close & Deliver', '2+ deals closed, Studio service live', '2026-05-23', 0, 3),
('b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', 'Sprint 4: Optimize & Scale', 'Ads optimization, SEO blog #1-2, pipeline growth', '2026-06-06', 0, 4);

INSERT INTO projects (id, name, description, cycle_id, owner_id, organization_id, status, priority) VALUES
('c0000000-0000-0000-0000-000000000001', 'Website & Portfolio', 'Hoàn thiện tulie.agency: SEO, case studies, portfolio, pricing page. Nền tảng thu hút leads online.', 'c0000000-0000-0000-0000-000000000001', NULL, 'a0000000-0000-0000-0000-000000000001', 'active', 'high'),
('f0000000-0000-0000-0000-000000000002', 'Marketing & Ads', 'Facebook Ads, Google Ads, SEO, Content calendar. Tất cả kênh marketing driving leads.', 'c0000000-0000-0000-0000-000000000001', NULL, 'a0000000-0000-0000-0000-000000000001', 'active', 'high'),
('f0000000-0000-0000-0000-000000000003', 'Sales & Pipeline', 'Cold outreach, warm leads, proposals, CRM. Toàn bộ hoạt động bán hàng và quản lý pipeline.', 'c0000000-0000-0000-0000-000000000001', NULL, 'a0000000-0000-0000-0000-000000000001', 'active', 'high'),
('f0000000-0000-0000-0000-000000000004', 'Chatbot Product', 'Phát triển Tulie Chatbot subscription service. MVP, pricing, first 3 customers.', 'c0000000-0000-0000-0000-000000000002', NULL, 'a0000000-0000-0000-0000-000000000001', 'planning', 'high'),
('f0000000-0000-0000-0000-000000000005', 'Operations & Hiring', 'Office setup, recruitment, SOPs, team onboarding. Xây dựng nền tảng vận hành.', 'c0000000-0000-0000-0000-000000000002', NULL, 'a0000000-0000-0000-0000-000000000001', 'planning', 'medium'),
('f0000000-0000-0000-0000-000000000006', 'Strategy & Finance', 'P&L tracking, budget management, milestone reviews, strategic planning sessions.', 'c0000000-0000-0000-0000-000000000001', NULL, 'a0000000-0000-0000-0000-000000000001', 'active', 'medium');

INSERT INTO tags (id, name, color, organization_id) VALUES
('e0000000-0000-0000-0000-000000000001', 'marketing', '#7B1FA2', 'a0000000-0000-0000-0000-000000000001'),
('e0000000-0000-0000-0000-000000000002', 'sales', '#00897B', 'a0000000-0000-0000-0000-000000000001'),
('e0000000-0000-0000-0000-000000000003', 'hiring', '#FB8C00', 'a0000000-0000-0000-0000-000000000001'),
('e0000000-0000-0000-0000-000000000004', 'finance', '#43A047', 'a0000000-0000-0000-0000-000000000001'),
('e0000000-0000-0000-0000-000000000005', 'seo', '#1E88E5', 'a0000000-0000-0000-0000-000000000001'),
('e0000000-0000-0000-0000-000000000006', 'content', '#E91E63', 'a0000000-0000-0000-0000-000000000001'),
('e0000000-0000-0000-0000-000000000007', 'ads', '#FF5722', 'a0000000-0000-0000-0000-000000000001'),
('e0000000-0000-0000-0000-000000000008', 'product', '#673AB7', 'a0000000-0000-0000-0000-000000000001'),
('e0000000-0000-0000-0000-000000000009', 'operations', '#795548', 'a0000000-0000-0000-0000-000000000001'),
('e0000000-0000-0000-0000-000000000010', 'design', '#FF6F00', 'a0000000-0000-0000-0000-000000000001'),
('e0000000-0000-0000-0000-000000000011', 'development', '#0288D1', 'a0000000-0000-0000-0000-000000000001'),
('e0000000-0000-0000-0000-000000000012', 'sprint_1', '#E53935', 'a0000000-0000-0000-0000-000000000001'),
('e0000000-0000-0000-0000-000000000013', 'sprint_2', '#D81B60', 'a0000000-0000-0000-0000-000000000001');

INSERT INTO tasks (id, title, description, project_id, created_by, assigned_to, status, eisenhower_quadrant, estimated_effort_hours, hofstadter_multiplier, requested_deadline, scheduled_start, scheduled_end, priority, cycle_id, milestone_id) VALUES
('tk000001', 'Audit website tulie.agency: kiểm tra SEO, content, performance', 'Kiểm tra toàn bộ meta tags, title, description, alt text images. Đánh giá Core Web Vitals. Liệt kê tất cả issues cần fix.', 'c0000000-0000-0000-0000-000000000001', NULL, NULL, 'ready', 'Q1', 2.0, 1.20, '2026-04-11T17:00:00Z', '2026-04-11T08:30:00Z', '2026-04-11T10:30:00Z', 20, 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001'),
('tk000002', 'Fix meta tags (title, description) cho tất cả trang tulie.agency', 'Update meta tags theo SEO strategy document. Mỗi trang cần unique title (50-60 chars) + description (150-160 chars).', 'c0000000-0000-0000-0000-000000000001', NULL, NULL, 'ready', 'Q1', 1.5, 1.20, '2026-04-11T17:00:00Z', '2026-04-11T10:30:00Z', '2026-04-11T12:00:00Z', 19, 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001'),
('tk000003', 'Setup Google Search Console + Analytics 4 cho tulie.agency', 'Verify domain ownership. Install GA4 tracking code. Submit sitemap. Verify indexing.', 'c0000000-0000-0000-0000-000000000001', NULL, NULL, 'ready', 'Q1', 1.0, 1.20, '2026-04-11T17:00:00Z', '2026-04-11T13:00:00Z', '2026-04-11T14:00:00Z', 18, 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001'),
('tk000004', 'Viết case study #1: ADDJ — Website tăng 200% traffic', 'Viết case study theo template: Khách hàng, Vấn đề, Giải pháp Tulie, Kết quả (metrics), Testimonial.', 'c0000000-0000-0000-0000-000000000001', NULL, NULL, 'ready', 'Q2', 2.0, 1.20, '2026-04-12T17:00:00Z', '2026-04-11T14:00:00Z', '2026-04-11T16:00:00Z', 17, 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001'),
('tk000005', 'Setup Google Business Profile cho Tulie Agency', 'Claim business. Add category: Web Designer + Marketing Agency. Upload 20+ photos. Write optimized description.', 'c0000000-0000-0000-0000-000000000001', NULL, NULL, 'backlog', 'Q2', 1.0, 1.20, '2026-04-11T17:30:00Z', '2026-04-11T16:00:00Z', '2026-04-11T17:00:00Z', 15, 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001'),
('tk000006', 'Viết case study #2: Hamedco — B2B Medical Device Website', 'Case study Hamedco: Website thiết bị y tế B2B. Focus on SEO + organic traffic grow.', 'c0000000-0000-0000-0000-000000000001', NULL, NULL, 'backlog', 'Q2', 2.0, 1.20, '2026-04-12T17:00:00Z', NULL, NULL, 16, 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001'),
('tk000007', 'Viết case study #3: DuaxCar Kitchen — F&B Website', 'Case study DuaxCar: F&B website + lead generation. Kết quả: tăng 300% leads online.', 'c0000000-0000-0000-0000-000000000001', NULL, NULL, 'backlog', 'Q2', 2.0, 1.20, '2026-04-12T17:00:00Z', NULL, NULL, 15, 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001'),
('tk000008', 'Tạo trang /bang-gia với bảng giá chi tiết 4 gói dịch vụ', 'Pricing page: Starter 5tr, Business 15tr, Premium 30tr, Enterprise 50tr+. Bao gồm comparison table, features, CTA.', 'c0000000-0000-0000-0000-000000000001', NULL, NULL, 'backlog', 'Q1', 2.0, 1.20, '2026-04-12T17:00:00Z', NULL, NULL, 18, 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001'),
('tk000009', 'Setup Facebook Business Page: Tulie Agency', 'Tạo page, upload cover + avatar, about section, services tab, CTA button → Messenger. Setup auto-reply.', 'f0000000-0000-0000-0000-000000000002', NULL, NULL, 'backlog', 'Q1', 1.5, 1.20, '2026-04-12T17:00:00Z', NULL, NULL, 17, 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001'),
('tk000010', 'Setup Zalo OA cho Tulie TSS', 'Tạo Zalo Official Account. Logo + cover. Menu bottom: Bảng giá | Portfolio | Liên hệ. Auto-reply welcome message.', 'f0000000-0000-0000-0000-000000000002', NULL, NULL, 'backlog', 'Q2', 1.0, 1.20, '2026-04-12T17:30:00Z', NULL, NULL, 14, 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001'),
('tk000011', 'Thiết kế sales proposal template (PDF/Figma)', 'Template proposal chuyên nghiệp 5-8 trang: cover, about Tulie, service description, pricing, timeline, terms.', 'f0000000-0000-0000-0000-000000000003', NULL, NULL, 'backlog', 'Q1', 3.0, 1.20, '2026-04-13T17:00:00Z', NULL, NULL, 19, 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001'),
('tk000012', 'Thiết kế quotation template cho Agency + Studio', 'Template báo giá chi tiết: items, quantity, unit price, total, terms, payment schedule. 2 versions.', 'f0000000-0000-0000-0000-000000000003', NULL, NULL, 'backlog', 'Q1', 2.0, 1.20, '2026-04-13T17:00:00Z', NULL, NULL, 18, 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001'),
('tk000013', 'Gọi/nhắn 50 khách hàng cũ chào dịch vụ Tulie Agency', 'Danh sách KH cũ từ các dự án trước. Gọi/Zalo/Email giới thiệu dịch vụ mới. Target: 50 contacts reached.', 'f0000000-0000-0000-0000-000000000003', NULL, NULL, 'backlog', 'Q1', 4.0, 1.20, '2026-04-14T17:00:00Z', NULL, NULL, 20, 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001'),
('tk000014', 'Đăng bài Facebook — Portfolio carousel (5 websites)', 'Post theo template Content Calendar: "5 website đẹp nhất Tulie đã thiết kế". Format: Carousel 5 ảnh.', 'f0000000-0000-0000-0000-000000000002', NULL, NULL, 'backlog', 'Q2', 1.0, 1.20, '2026-04-14T12:00:00Z', NULL, NULL, 14, 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001'),
('tk000015', 'Cold email 30 SME từ Google Maps / Yellow Pages', 'Research 30 SME Hà Nội chưa có website (hoặc website cũ): F&B, Retail, Education, Service. Gửi email giới thiệu.', 'f0000000-0000-0000-0000-000000000003', NULL, NULL, 'backlog', 'Q2', 2.0, 1.20, '2026-04-15T17:00:00Z', NULL, NULL, 16, 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001'),
('tk000016', 'Viết blog #1: "Bảng giá thiết kế website 2026"', 'Blog SEO 2500-3000 từ. Target keyword: "bảng giá thiết kế website" (590 searches/mo).', 'f0000000-0000-0000-0000-000000000002', NULL, NULL, 'backlog', 'Q2', 3.0, 1.20, '2026-04-18T17:00:00Z', NULL, NULL, 13, 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001'),
('tk000017', 'Setup Facebook Pixel + Conversion API trên tulie.agency', 'Install FB Pixel. Configure Conversion API for server-side tracking. Test events: PageView, Lead, ViewContent.', 'f0000000-0000-0000-0000-000000000002', NULL, NULL, 'backlog', 'Q1', 1.0, 1.20, '2026-04-14T17:00:00Z', NULL, NULL, 18, 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001'),
('tk000018', 'Launch Facebook Ads Campaign #1: Website Design Leads', 'Campaign structure: Ad Set 1.1 SME Owner HN, Ad Set 1.2 F&B Owners, Ad Set 1.3 Retarget Visitors. Budget 80k/ngày.', 'f0000000-0000-0000-0000-000000000002', NULL, NULL, 'backlog', 'Q1', 3.0, 1.20, '2026-04-21T17:00:00Z', NULL, NULL, 17, 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002'),
('tk000019', 'Thêm Zalo chat widget vào tulie.agency', 'Install Zalo chat plugin. Position: bottom-right. Test on mobile + desktop.', 'c0000000-0000-0000-0000-000000000001', NULL, NULL, 'ready', 'Q1', 0.5, 1.20, '2026-04-11T17:00:00Z', '2026-04-11T17:00:00Z', '2026-04-11T17:30:00Z', 20, 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001'),
('tk000020', 'Thêm exit popup "Nhận báo giá miễn phí" khi user rời trang', 'Exit-intent popup: form Name + Phone + Service. Connect to CRM / email.', 'c0000000-0000-0000-0000-000000000001', NULL, NULL, 'backlog', 'Q2', 1.0, 1.20, '2026-04-14T17:00:00Z', NULL, NULL, 15, 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001');

INSERT INTO task_tags (task_id, tag_id) VALUES
('tk000001', 'e0000000-0000-0000-0000-000000000005'),
('tk000001', 'e0000000-0000-0000-0000-000000000010'),
('tk000002', 'e0000000-0000-0000-0000-000000000005'),
('tk000002', 'e0000000-0000-0000-0000-000000000011'),
('tk000003', 'e0000000-0000-0000-0000-000000000005'),
('tk000003', 'e0000000-0000-0000-0000-000000000011'),
('tk000004', 'e0000000-0000-0000-0000-000000000006'),
('tk000004', 'e0000000-0000-0000-0000-000000000005'),
('tk000005', 'e0000000-0000-0000-0000-000000000005'),
('tk000005', 'e0000000-0000-0000-0000-000000000001'),
('tk000006', 'e0000000-0000-0000-0000-000000000006'),
('tk000007', 'e0000000-0000-0000-0000-000000000006'),
('tk000008', 'e0000000-0000-0000-0000-000000000005'),
('tk000008', 'e0000000-0000-0000-0000-000000000010'),
('tk000009', 'e0000000-0000-0000-0000-000000000001'),
('tk000009', 'e0000000-0000-0000-0000-000000000006'),
('tk000010', 'e0000000-0000-0000-0000-000000000001'),
('tk000011', 'e0000000-0000-0000-0000-000000000002'),
('tk000011', 'e0000000-0000-0000-0000-000000000010'),
('tk000012', 'e0000000-0000-0000-0000-000000000002'),
('tk000012', 'e0000000-0000-0000-0000-000000000010'),
('tk000013', 'e0000000-0000-0000-0000-000000000002'),
('tk000014', 'e0000000-0000-0000-0000-000000000006'),
('tk000014', 'e0000000-0000-0000-0000-000000000001'),
('tk000015', 'e0000000-0000-0000-0000-000000000002'),
('tk000016', 'e0000000-0000-0000-0000-000000000005'),
('tk000016', 'e0000000-0000-0000-0000-000000000006'),
('tk000017', 'e0000000-0000-0000-0000-000000000007'),
('tk000017', 'e0000000-0000-0000-0000-000000000011'),
('tk000018', 'e0000000-0000-0000-0000-000000000007'),
('tk000018', 'e0000000-0000-0000-0000-000000000001'),
('tk000019', 'e0000000-0000-0000-0000-000000000011'),
('tk000019', 'e0000000-0000-0000-0000-000000000001'),
('tk000020', 'e0000000-0000-0000-0000-000000000011'),
('tk000020', 'e0000000-0000-0000-0000-000000000001');

INSERT INTO deals (id, organization_id, name, company, contact_name, contact_email, contact_phone, stage, value, probability, expected_close_date, notes) VALUES
('d0000001-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Nhà hàng Phở 36', 'Nhà hàng Phở 36', 'Anh Hoàng', 'hoang@pho36.vn', '0912345678', 'prospecting', 15000000, 20, '2026-04-30', 'Nhà hàng phở có 3 chi nhánh, chưa có website.'),
('d0000001-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Spa & Beauty Lan Chi', 'Spa & Beauty Lan Chi', 'Chị Lan', 'lan@lanchi.vn', '0987654321', 'qualified', 5000000, 40, '2026-04-25', 'Inbox từ FB Ads. Cần landing page booking spa.'),
('d0000001-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Minh Phát Trading', 'Minh Phát Trading', 'Anh Minh', 'minh@minhphat.com', '0909123456', 'meeting', 25000000, 60, '2026-05-15', 'Cần web doanh nghiệp + catalog sản phẩm 50+ SPU.'),
('d0000001-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'BrightStar Education', 'Trung tâm Anh ngữ BrightStar', 'Chị Hằng', 'hang@brightstar.edu.vn', '0911222333', 'proposal', 18000000, 70, '2026-04-20', 'Website trường học 8 trang + form đăng ký học viên.'),
('d0000001-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Gym & Fitness ProMax', 'Gym & Fitness ProMax', 'Anh Đức', NULL, '0922333444', 'lead', 3000000, 15, '2026-05-30', 'Hỏi qua Zalo OA về chatbot tự động trả lời KH.');

INSERT INTO monthly_finance (id, organization_id, month, revenue, cogs, opex, notes) VALUES
('a0000001-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', '2026-04-01', 0, 0, 5580000, 'Bootstrap month - investment phase'),
('a0000001-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', '2026-05-01', 25000000, 1000000, 5580000, 'First revenue target'),
('a0000001-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', '2026-06-01', 80000000, 2000000, 14500000, 'Chatbot launch + CTV sales'),
('a0000001-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', '2026-07-01', 120000000, 3000000, 14500000, 'Scale pipeline'),
('a0000001-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', '2026-08-01', 150000000, 5000000, 34500000, 'Office + new hires start'),
('a0000001-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', '2026-09-01', 180000000, 6000000, 34500000, 'Team operational'),
('a0000001-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', '2026-10-01', 200000000, 7000000, 34500000, 'SaaS beta launch'),
('a0000001-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', '2026-11-01', 280000000, 10000000, 56500000, 'Frontend hire onboarding'),
('a0000001-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', '2026-12-01', 350000000, 12000000, 56500000, 'Year-end push - target 300tr/mo');

INSERT INTO hiring_plans (id, organization_id, position, employment_type, target_start_month, status, salary_range_min, salary_range_max, priority, notes) VALUES
('b0000001-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'CTV Sales (Commission-based)', 'ctv', '2026-06-01', 'planning', 0, 0, 'high', 'CTV bán hàng theo commission 10-15%.'),
('b0000001-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'UI/UX Designer FTE', 'fte', '2026-09-01', 'planning', 8000000, 12000000, 'high', 'Thiết kế UI/UX website, landing page, social media assets.'),
('b0000001-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Sales Executive FTE', 'fte', '2026-09-15', 'planning', 7000000, 10000000, 'high', 'Chuyên viên kinh doanh phụ trách tìm kiếm, tư vấn và chốt đơn.'),
('b0000001-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Frontend Developer FTE', 'fte', '2026-11-01', 'planning', 12000000, 18000000, 'medium', 'Phát triển website KH bằng Next.js/React.');

INSERT INTO sales_targets (id, organization_id, month, target_revenue, actual_revenue, deals_closed, notes) VALUES
('c0000001-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', '2026-04-01', 25000000, 0, 0, 'Bootstrap phase'),
('c0000001-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', '2026-05-01', 45000000, 0, 0, 'First deals target'),
('c0000001-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', '2026-06-01', 80000000, 0, 0, 'Chatbot MRR included'),
('c0000001-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', '2026-07-01', 120000000, 0, 0, 'Scale target'),
('c0000001-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', '2026-08-01', 150000000, 0, 0, 'Office + hires'),
('c0000001-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', '2026-09-01', 180000000, 0, 0, 'Full team operational'),
('c0000001-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', '2026-10-01', 200000000, 0, 0, 'SaaS beta'),
('c0000001-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', '2026-11-01', 280000000, 0, 0, 'Growth phase'),
('c0000001-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', '2026-12-01', 350000000, 0, 0, 'Year-end target');

INSERT INTO content_calendar (id, organization_id, planned_date, content_type, topic, platform, status, notes) VALUES
('d0000001-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', '2026-04-14', 'carousel', '5 website đẹp nhất Tulie đã thiết kế', 'facebook', 'planned', 'Portfolio showcase post'),
('d0000001-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', '2026-04-14', 'image', 'Vì sao 67% SME Việt Nam chưa có website?', 'linkedin', 'planned', 'Educational content'),
('d0000001-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', '2026-04-15', 'image', '5 lỗi phổ biến trên website doanh nghiệp Việt', 'facebook', 'planned', 'Educational content'),
('d0000001-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', '2026-04-15', 'article', 'Giới thiệu dịch vụ Tulie Agency', 'zalo', 'planned', 'Service introduction'),
('d0000001-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', '2026-04-16', 'video', '1 ngày làm việc tại Tulie — BTS', 'facebook', 'draft', 'Behind the scenes'),
('d0000001-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', '2026-04-17', 'image', 'Case Study: ADDJ — Website tăng 200% traffic', 'facebook', 'draft', 'Case study post'),
('d0000001-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', '2026-04-18', 'image', 'OFFER tháng 4: Website giảm 20% + tặng hosting', 'facebook', 'draft', 'Promotional offer');

INSERT INTO marketing_metrics (id, organization_id, date, channel, metric_name, value) VALUES
('e0000001-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', '2026-04-14', 'facebook_ads', 'spend', 560000),
('e0000001-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', '2026-04-14', 'facebook_ads', 'impressions', 7000),
('e0000001-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', '2026-04-14', 'facebook_ads', 'clicks', 350),
('e0000001-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', '2026-04-14', 'facebook_ads', 'leads', 5),
('e0000001-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', '2026-04-14', 'cold_outreach', 'leads', 3),
('e0000001-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', '2026-04-14', 'zalo', 'spend', 300000),
('e0000001-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', '2026-04-14', 'zalo', 'leads', 2);

INSERT INTO transactions (id, organization_id, date, type, category, description, amount) VALUES
('f0000001-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', '2026-04-11', 'expense', 'marketing', 'Zalo ZNS — 300 tin nhắn broadcast', 300000),
('f0000001-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', '2026-04-14', 'expense', 'marketing', 'Facebook Ads — Campaign "Website Design Leads" tuần 1', 500000),
('f0000001-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', '2026-04-11', 'expense', 'tools', 'Canva Pro — Tháng 4/2026', 200000),
('f0000001-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', '2026-04-01', 'expense', 'tools', 'ChatGPT Plus — Tháng 4/2026', 500000),
('f0000001-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', '2026-04-01', 'expense', 'operations', 'Coworking space — Tháng 4 (part-time desk)', 2500000);
