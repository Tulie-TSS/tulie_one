-- Migration: 002_okr_kpi.sql
-- Description: OKR and KPI tracking tables for Tulie Workspace
-- Date: 2026-04-14

DROP TABLE IF EXISTS kpi_progress_log CASCADE;
DROP TABLE IF EXISTS kpis CASCADE;
DROP TABLE IF EXISTS key_result_updates CASCADE;
DROP TABLE IF EXISTS key_results CASCADE;
DROP TABLE IF EXISTS okr_periods CASCADE;
DROP TABLE IF EXISTS okrs CASCADE;

DROP TYPE IF EXISTS okr_status CASCADE;
DROP TYPE IF EXISTS kpi_category CASCADE;
DROP TYPE IF EXISTS kpi_frequency CASCADE;

-- ============================================
-- ENUM TYPES
-- ============================================

CREATE TYPE okr_status AS ENUM ('draft', 'active', 'completed', 'cancelled');
CREATE TYPE kpi_category AS ENUM ('sales', 'marketing', 'operations', 'finance', 'lab', 'agency');
CREATE TYPE kpi_frequency AS ENUM ('daily', 'weekly', 'monthly', 'quarterly');

-- ============================================
-- OKR PERIODS (Quarter/Year tracking)
-- ============================================

CREATE TABLE okr_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    period_type VARCHAR(20) NOT NULL CHECK (period_type IN ('quarter', 'year', 'month')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, name)
);

-- ============================================
-- OKRs (Objectives)
-- ============================================

CREATE TABLE okrs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    period_id UUID REFERENCES okr_periods(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category kpi_category NOT NULL,
    owner_id UUID REFERENCES auth.users(id),
    status okr_status NOT NULL DEFAULT 'draft',
    progress DECIMAL(5,2) DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    quarter VARCHAR(10),
    year INT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- KEY RESULTS
-- ============================================

CREATE TABLE key_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    okr_id UUID NOT NULL REFERENCES okrs(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    target_value DECIMAL(12,2) NOT NULL,
    current_value DECIMAL(12,2) DEFAULT 0,
    unit VARCHAR(50) DEFAULT 'count',
    metric_type VARCHAR(20) NOT NULL DEFAULT 'number' CHECK (metric_type IN ('number', 'percentage', 'currency', 'boolean')),
    start_value DECIMAL(12,2) DEFAULT 0,
    confidence_level DECIMAL(3,2) DEFAULT 0.5 CHECK (confidence_level >= 0 AND confidence_level <= 1),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- KEY RESULT UPDATES (Progress history)
-- ============================================

CREATE TABLE key_result_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_result_id UUID NOT NULL REFERENCES key_results(id) ON DELETE CASCADE,
    value DECIMAL(12,2) NOT NULL,
    note TEXT,
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- KPIs (Standalone Key Metrics)
-- ============================================

CREATE TABLE kpis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category kpi_category NOT NULL,
    frequency kpi_frequency NOT NULL DEFAULT 'monthly',
    target_value DECIMAL(12,2) NOT NULL,
    current_value DECIMAL(12,2) DEFAULT 0,
    unit VARCHAR(50) DEFAULT 'count',
    metric_type VARCHAR(20) NOT NULL DEFAULT 'number' CHECK (metric_type IN ('number', 'percentage', 'currency', 'boolean')),
    parent_kpi_id UUID REFERENCES kpis(id) ON DELETE SET NULL,
    owner_id UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT true,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- KPI PROGRESS LOG
-- ============================================

CREATE TABLE kpi_progress_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kpi_id UUID NOT NULL REFERENCES kpis(id) ON DELETE CASCADE,
    value DECIMAL(12,2) NOT NULL,
    note TEXT,
    logged_by UUID REFERENCES auth.users(id),
    logged_at DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_okrs_org ON okrs(organization_id);
CREATE INDEX idx_okrs_period ON okrs(period_id);
CREATE INDEX idx_okrs_status ON okrs(organization_id, status);
CREATE INDEX idx_okrs_category ON okrs(organization_id, category);

CREATE INDEX idx_key_results_okr ON key_results(okr_id);

CREATE INDEX idx_kpi_updates_kr ON key_result_updates(key_result_id, created_at DESC);

CREATE INDEX idx_kpis_org ON kpis(organization_id);
CREATE INDEX idx_kpis_category ON kpis(organization_id, category);
CREATE INDEX idx_kpis_active ON kpis(organization_id) WHERE is_active = true;

CREATE INDEX idx_kpi_progress_log_kpi ON kpi_progress_log(kpi_id, logged_at DESC);

-- ============================================
-- TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION calculate_okr_progress()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE okrs
    SET progress = (
        SELECT COALESCE(AVG(
            CASE 
                WHEN kr.metric_type = 'percentage' THEN kr.current_value
                WHEN kr.metric_type = 'boolean' THEN CASE WHEN kr.current_value = 1 THEN 100 ELSE 0 END
                WHEN kr.target_value > 0 THEN (kr.current_value / kr.target_value) * 100
                ELSE 0
            END
        ), 0)
        FROM key_results kr
        WHERE kr.okr_id = NEW.okr_id
    )
    WHERE id = NEW.okr_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_key_result_progress
    AFTER INSERT OR UPDATE OF current_value ON key_results
    FOR EACH ROW
    EXECUTE FUNCTION calculate_okr_progress();

-- ============================================
-- SEED DATA
-- ============================================

-- OKR Periods for 2026
INSERT INTO okr_periods (id, organization_id, name, period_type, start_date, end_date, is_active) VALUES
('p000001-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Q2 2026', 'quarter', '2026-04-01', '2026-06-30', true),
('p000002-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Q3 2026', 'quarter', '2026-07-01', '2026-09-30', false),
('p000003-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Q4 2026', 'quarter', '2026-10-01', '2026-12-31', false);

-- Q2 2026 OKRs aligned with Lab + Agency strategy
INSERT INTO okrs (id, organization_id, period_id, title, description, category, status, progress, quarter, year) VALUES
-- Agency OKRs
('o000001-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'p000001-0000-0000-0000-000000000001', 'Agency: Đạt 95M revenue tháng', 'Đạt target revenue 40M Agency + 55M tổng (bao gồm Lab) trong Q2', 'agency', 'active', 0, 'Q2', 2026),
('o000002-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'p000001-0000-0000-0000-000000000001', 'Agency: 3 deals closed', 'Chốt 3 deals Agency trong Q2', 'agency', 'active', 0, 'Q2', 2026),
('o000003-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'p000001-0000-0000-0000-000000000001', 'Agency: 50 outreach done', 'Thực hiện 50 cold outreach trong Q2', 'agency', 'active', 0, 'Q2', 2026),

-- Lab OKRs
('o000004-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'p000001-0000-0000-0000-000000000001', 'Lab: Launch AI CV Course', 'Ra mắt khoá AI viết CV trong T4', 'lab', 'active', 0, 'Q2', 2026),
('o000005-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'p000001-0000-0000-0000-000000000001', 'Lab: 50 students enrolled', 'Có 50 học viên đăng ký khoá Lab trong Q2', 'lab', 'active', 0, 'Q2', 2026),
('o000006-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'p000001-0000-0000-0000-000000000001', 'Lab: Launch AI Academic Course', 'Ra mắt khoá AI nghiên cứu khoa học trong T5', 'lab', 'active', 0, 'Q2', 2026),

-- Operations OKRs
('o000007-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'p000001-0000-0000-0000-000000000001', 'Ops: Tuyển part-time Admin', 'Thuê Admin part-time từ T4', 'operations', 'active', 0, 'Q2', 2026),
('o000008-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'p000001-0000-0000-0000-000000000001', 'Ops: Tuyển part-time Dev', 'Thuê Dev AI-savvy part-time từ T5', 'operations', 'active', 0, 'Q2', 2026);

-- Key Results for OKRs
INSERT INTO key_results (id, okr_id, title, target_value, current_value, unit, metric_type, start_value) VALUES
-- Agency Revenue KR
('kr00001-0000-0000-0000-000000000001', 'o000001-0000-0000-0000-000000000001', 'Agency revenue T4', 25000000, 0, 'VND', 'currency', 0),
('kr00002-0000-0000-0000-000000000001', 'o000001-0000-0000-0000-000000000001', 'Agency revenue T5', 30000000, 0, 'VND', 'currency', 0),
('kr00003-0000-0000-0000-000000000001', 'o000001-0000-0000-0000-000000000001', 'Agency revenue T6', 40000000, 0, 'VND', 'currency', 0),

-- Agency Deals KR
('kr00004-0000-0000-0000-000000000001', 'o000002-0000-0000-0000-000000000001', 'Deals closed T4', 1, 0, 'deals', 'number', 0),
('kr00005-0000-0000-0000-000000000001', 'o000002-0000-0000-0000-000000000001', 'Deals closed T5', 1, 0, 'deals', 'number', 0),
('kr00006-0000-0000-0000-000000000001', 'o000002-0000-0000-0000-000000000001', 'Deals closed T6', 1, 0, 'deals', 'number', 0),

-- Agency Outreach KR
('kr00007-0000-0000-0000-000000000001', 'o000003-0000-0000-0000-000000000001', 'Cold outreach T4', 15, 0, 'contacts', 'number', 0),
('kr00008-0000-0000-0000-000000000001', 'o000003-0000-0000-0000-000000000001', 'Cold outreach T5', 15, 0, 'contacts', 'number', 0),
('kr00009-0000-0000-0000-000000000001', 'o000003-0000-0000-0000-000000000001', 'Cold outreach T6', 20, 0, 'contacts', 'number', 0),

-- Lab AI CV Course KR
('kr00010-0000-0000-0000-000000000001', 'o000004-0000-0000-0000-000000000001', 'Course outline completed', 1, 0, 'done', 'boolean', 0),
('kr00011-0000-0000-0000-000000000001', 'o000004-0000-0000-0000-000000000001', 'Course content 50% done', 1, 0, 'done', 'boolean', 0),
('kr00012-0000-0000-0000-000000000001', 'o000004-0000-0000-0000-000000000001', 'Course launched', 1, 0, 'done', 'boolean', 0),

-- Lab Students KR
('kr00013-0000-0000-0000-000000000001', 'o000005-0000-0000-0000-000000000001', 'Students enrolled T4', 10, 0, 'students', 'number', 0),
('kr00014-0000-0000-0000-000000000001', 'o000005-0000-0000-0000-000000000001', 'Students enrolled T5', 20, 0, 'students', 'number', 0),
('kr00015-0000-0000-0000-000000000001', 'o000005-0000-0000-0000-000000000001', 'Students enrolled T6', 20, 0, 'students', 'number', 0),

-- Lab AI Academic Course KR
('kr00016-0000-0000-0000-000000000001', 'o000006-0000-0000-0000-000000000001', 'Course outline completed', 1, 0, 'done', 'boolean', 0),
('kr00017-0000-0000-0000-000000000001', 'o000006-0000-0000-0000-000000000001', 'Course launched T5', 1, 0, 'done', 'boolean', 0),

-- Ops Admin KR
('kr00018-0000-0000-0000-000000000001', 'o000007-0000-0000-0000-000000000001', 'Admin hired T4', 1, 0, 'done', 'boolean', 0),

-- Ops Dev KR
('kr00019-0000-0000-0000-000000000001', 'o000008-0000-0000-0000-000000000001', 'Dev hired T5', 1, 0, 'done', 'boolean', 0);

-- Standalone KPIs aligned with strategy
INSERT INTO kpis (id, organization_id, name, description, category, frequency, target_value, current_value, unit, metric_type, is_active) VALUES
-- Sales KPIs
('kpi00001-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Monthly Revenue (Agency)', 'Agency revenue target hàng tháng', 'sales', 'monthly', 40000000, 0, 'VND', 'currency', true),
('kpi00002-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Monthly Revenue (Lab)', 'Lab revenue target hàng tháng', 'lab', 'monthly', 30000000, 0, 'VND', 'currency', true),
('kpi00003-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Deals Closed', 'Số deals đã chốt trong tháng', 'sales', 'monthly', 2, 0, 'deals', 'number', true),
('kpi00004-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Pipeline Value', 'Tổng giá trị pipeline hiện tại', 'sales', 'monthly', 100000000, 0, 'VND', 'currency', true),
('kpi00005-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Conversion Rate', 'Tỷ lệ chuyển đổi từ lead sang deal', 'sales', 'monthly', 20, 0, '%', 'percentage', true),

-- Marketing KPIs
('kpi00006-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Outreach Count', 'Số lượng cold outreach đã thực hiện', 'marketing', 'monthly', 50, 0, 'contacts', 'number', true),
('kpi00007-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Content Published', 'Số content đã đăng trong tháng', 'marketing', 'monthly', 12, 0, 'posts', 'number', true),
('kpi00008-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Leads Generated', 'Số leads mới từ marketing', 'marketing', 'monthly', 20, 0, 'leads', 'number', true),

-- Lab KPIs
('kpi00009-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Course Students', 'Số học viên đăng ký khoá học', 'lab', 'monthly', 50, 0, 'students', 'number', true),
('kpi00010-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Lab Revenue', 'Doanh thu Lab từ khoá học', 'lab', 'monthly', 30000000, 0, 'VND', 'currency', true),
('kpi00011-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Content Conversion Rate', 'Tỷ lệ chuyển đổi từ view sang đăng ký', 'lab', 'monthly', 5, 0, '%', 'percentage', true),

-- Operations KPIs
('kpi00012-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Tasks Completed', 'Số tasks hoàn thành trong tháng', 'operations', 'monthly', 30, 0, 'tasks', 'number', true),
('kpi00013-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'On-time Delivery', 'Tỷ lệ giao hàng đúng hạn', 'operations', 'monthly', 90, 0, '%', 'percentage', true),

-- Finance KPIs
('kpi00014-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Net Profit', 'Lợi nhuận ròng hàng tháng', 'finance', 'monthly', 20000000, 0, 'VND', 'currency', true),
('kpi00015-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Burn Rate', 'Chi phí burn rate hàng tháng', 'finance', 'monthly', 60000000, 0, 'VND', 'currency', true);
