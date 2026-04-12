-- Migration: 001_strategy_planning.sql
-- Description: Strategy planning tables from branding planner
-- Date: 2026-04-12
-- Note: All tables prefixed with "strategy_" to avoid conflicts with other projects on same Supabase instance

-- ============================================
-- ENUM TYPES FOR STRATEGY
-- ============================================

CREATE TYPE strategy_product_type AS ENUM (
    'website_design', 'chatbot', 'studio', 
    'crm_saas', 'landing_page', 'other'
);

CREATE TYPE strategy_milestone_status AS ENUM (
    'pending', 'in_progress', 'completed', 'delayed', 'cancelled'
);

CREATE TYPE strategy_milestone_phase AS ENUM (
    'phase_1', 'phase_2', 'phase_3', 'phase_4'
);

CREATE TYPE strategy_content_pillar_type AS ENUM (
    'showcase', 'educate', 'trust', 'convert'
);

CREATE TYPE strategy_seo_status AS ENUM (
    'not_started', 'in_progress', 'achieved', 'dropped'
);

CREATE TYPE strategy_channel_type AS ENUM (
    'facebook_ads', 'google_ads', 'cold_outreach', 
    'referral', 'seo_organic', 'other'
);

-- ============================================
-- GROWTH_TARGETS (MRR, customer targets)
-- ============================================

CREATE TABLE strategy_growth_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    month DATE NOT NULL,
    mrr_target DECIMAL(15,2) NOT NULL DEFAULT 0,
    mrr_actual DECIMAL(15,2),
    new_customers_target INT NOT NULL DEFAULT 0,
    new_customers_actual INT,
    churn_rate_target DECIMAL(5,2) DEFAULT 5.00,
    arpc_target DECIMAL(15,2) DEFAULT 12500000,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT uk_strategy_growth_targets_org_month UNIQUE (organization_id, month)
);

-- ============================================
-- PRODUCTS (Services with pricing)
-- ============================================

CREATE TABLE strategy_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    service_type strategy_product_type NOT NULL,
    description TEXT,
    price_min DECIMAL(15,2),
    price_max DECIMAL(15,2),
    price_unit VARCHAR(20) NOT NULL DEFAULT 'once' CHECK (price_unit IN ('once', 'monthly', 'yearly')),
    features JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STRATEGY_MILESTONES (16 critical milestones)
-- ============================================

CREATE TABLE strategy_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    target_date DATE NOT NULL,
    status strategy_milestone_status NOT NULL DEFAULT 'pending',
    phase strategy_milestone_phase NOT NULL,
    priority INT NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CONTENT_PILLARS (4 content pillars)
-- ============================================

CREATE TABLE strategy_content_pillars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    pillar_type strategy_content_pillar_type NOT NULL,
    percentage INT NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
    description TEXT,
    content_types JSONB DEFAULT '[]',
    posting_frequency INT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SEO_TARGETS (Keyword rankings)
-- ============================================

CREATE TABLE strategy_seo_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    keyword VARCHAR(500) NOT NULL,
    keyword_cluster VARCHAR(100),
    current_rank INT,
    target_rank INT,
    monthly_searches INT,
    difficulty VARCHAR(20),
    priority VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    status strategy_seo_status NOT NULL DEFAULT 'not_started',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT uk_strategy_seo_targets_org_keyword UNIQUE (organization_id, keyword)
);

-- ============================================
-- MARKETING_CHANNELS (CAC, LTV by channel)
-- ============================================

CREATE TABLE strategy_marketing_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    channel_name VARCHAR(100) NOT NULL,
    channel_type strategy_channel_type NOT NULL,
    cac_target DECIMAL(15,2),
    ltv_target DECIMAL(15,2),
    ltv_cac_ratio_target DECIMAL(5,2),
    budget_monthly DECIMAL(15,2),
    budget_spent DECIMAL(15,2),
    leads_target INT,
    leads_actual INT,
    customers_actual INT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_strategy_growth_targets_org_month ON strategy_growth_targets(organization_id, month);
CREATE INDEX idx_strategy_products_org_type ON strategy_products(organization_id, service_type);
CREATE INDEX idx_strategy_milestones_org_status ON strategy_milestones(organization_id, status);
CREATE INDEX idx_strategy_milestones_org_phase ON strategy_milestones(organization_id, phase);
CREATE INDEX idx_strategy_content_pillars_org_type ON strategy_content_pillars(organization_id, pillar_type);
CREATE INDEX idx_strategy_seo_targets_org_cluster ON strategy_seo_targets(organization_id, keyword_cluster);
CREATE INDEX idx_strategy_seo_targets_org_status ON strategy_seo_targets(organization_id, status);
CREATE INDEX idx_strategy_marketing_channels_org_type ON strategy_marketing_channels(organization_id, channel_type);

-- ============================================
-- SEED DATA
-- ============================================

DO $$
DECLARE
    org_id UUID := 'a0000000-0000-0000-0000-000000000001';
BEGIN
    -- Growth Targets (9 months: Apr-Dec 2026)
    INSERT INTO strategy_growth_targets (organization_id, month, mrr_target, new_customers_target, churn_rate_target) VALUES
        (org_id, '2026-04-01', 25000000, 4, 5.00),
        (org_id, '2026-05-01', 50000000, 6, 5.00),
        (org_id, '2026-06-01', 80000000, 8, 5.00),
        (org_id, '2026-07-01', 120000000, 10, 5.00),
        (org_id, '2026-08-01', 170000000, 14, 4.50),
        (org_id, '2026-09-01', 220000000, 16, 4.50),
        (org_id, '2026-10-01', 280000000, 18, 4.00),
        (org_id, '2026-11-01', 320000000, 20, 4.00),
        (org_id, '2026-12-01', 350000000, 22, 4.00);
    
    -- Products
    INSERT INTO strategy_products (organization_id, name, service_type, description, price_min, price_max, price_unit, features, is_active) VALUES
        (org_id, 'Thiết kế Website', 'website_design', 'Dịch vụ thiết kế website chuyên nghiệp', 8000000, 50000000, 'once', 
         '["Thiết kế theo yêu cầu", "Responsive design", "SEO cơ bản", "Bảo hành 12 tháng"]', true),
        (org_id, 'Chatbot AI', 'chatbot', 'Giải pháp Chatbot AI tự động hóa', 2000000, 10000000, 'monthly',
         '["Tích hợp đa nền tảng", "AI tự học", "Báo cáo chi tiết", "Hỗ trợ 24/7"]', true),
        (org_id, 'Studio Ảnh thẻ', 'studio', 'Dịch vụ chụp ảnh thẻ online', 100000, 250000, 'once',
         '["Nhanh chóng", "Chất lượng cao", "Giao file trong 24h"]', true),
        (org_id, 'CRM SaaS', 'crm_saas', 'Hệ thống quản lý khách hàng', 3000000, 5000000, 'monthly',
         '["Quản lý lead", "Tự động hóa sales", "Báo cáo doanh thu"]', true),
        (org_id, 'Landing Page', 'landing_page', 'Trang đích chuyển đổi cao', 5000000, 15000000, 'once',
         '["A/B testing", "Analytics", "SEO optimized", "Fast loading"]', true);
    
    -- Strategy Milestones (16 critical milestones)
    INSERT INTO strategy_milestones (organization_id, name, description, target_date, phase, priority, status) VALUES
        (org_id, 'Website launch', 'Hoàn thiện và launch website chính', '2026-04-15', 'phase_1', 1, 'in_progress'),
        (org_id, 'First 5 customers', 'Đạt 5 khách hàng đầu tiên', '2026-04-30', 'phase_1', 2, 'pending'),
        (org_id, 'Content system setup', 'Hoàn thiện hệ thống nội dung', '2026-05-15', 'phase_1', 3, 'pending'),
        (org_id, '50tr MRR', 'Đạt 50 triệu MRR', '2026-05-31', 'phase_1', 4, 'pending'),
        (org_id, 'Sales playbook', 'Hoàn thiện sales playbook', '2026-06-15', 'phase_2', 5, 'pending'),
        (org_id, '80tr MRR', 'Đạt 80 triệu MRR', '2026-06-30', 'phase_2', 6, 'pending'),
        (org_id, 'Automation setup', 'Hoàn thiện automation workflows', '2026-07-15', 'phase_2', 7, 'pending'),
        (org_id, '120tr MRR', 'Đạt 120 triệu MRR', '2026-07-31', 'phase_2', 8, 'pending'),
        (org_id, 'Team expansion', 'Mở rộng đội ngũ (3 FTE)', '2026-08-15', 'phase_3', 9, 'pending'),
        (org_id, '170tr MRR', 'Đạt 170 triệu MRR', '2026-08-31', 'phase_3', 10, 'pending'),
        (org_id, 'SEO authority', 'Đạt top 3 Google cho keywords chính', '2026-09-30', 'phase_3', 11, 'pending'),
        (org_id, '220tr MRR', 'Đạt 220 triệu MRR', '2026-09-30', 'phase_3', 12, 'pending'),
        (org_id, '280tr MRR', 'Đạt 280 triệu MRR', '2026-10-31', 'phase_3', 13, 'pending'),
        (org_id, 'Systems documented', 'Hoàn thiện tài liệu hệ thống', '2026-11-15', 'phase_4', 14, 'pending'),
        (org_id, '320tr MRR', 'Đạt 320 triệu MRR', '2026-11-30', 'phase_4', 15, 'pending'),
        (org_id, '350tr MRR Goal', 'Đạt mục tiêu 350 triệu MRR cuối năm', '2026-12-31', 'phase_4', 16, 'pending');
    
    -- Content Pillars (4 pillars)
    INSERT INTO strategy_content_pillars (organization_id, name, pillar_type, percentage, description, content_types, posting_frequency, is_active) VALUES
        (org_id, 'Showcase', 'showcase', 30, 'Portfolio & Case Studies - Thể hiện năng lực qua các dự án thực tế', 
         '["case_study", "portfolio", "testimonial"]', 6, true),
        (org_id, 'Educate', 'educate', 30, 'Tips, How-to, Industry - Giáo dục và cung cấp giá trị', 
         '["tips", "howto", "tutorial", "industry_news"]', 6, true),
        (org_id, 'Trust', 'trust', 25, 'Testimonials, BTS, Team - Xây dựng lòng tin', 
         '["testimonial", "bts", "team", "behind_the_scene"]', 5, true),
        (org_id, 'Convert', 'convert', 15, 'Offers, CTA, Pricing - Thúc đẩy chuyển đổi', 
         '["offer", "cta", "pricing", "promotion"]', 3, true);
    
    -- SEO Targets (top keywords)
    INSERT INTO strategy_seo_targets (organization_id, keyword, keyword_cluster, monthly_searches, difficulty, priority, status) VALUES
        (org_id, 'thiet ke website', 'website_design', 590, 'high', 'high', 'in_progress'),
        (org_id, 'thiet ke website ha noi', 'website_design', 320, 'medium', 'high', 'not_started'),
        (org_id, 'thiet ke website chuyen nghiep', 'website_design', 260, 'medium', 'medium', 'not_started'),
        (org_id, 'bang gia thiet ke website', 'website_design', 480, 'medium', 'high', 'not_started'),
        (org_id, 'chatbot ai', 'chatbot', 880, 'high', 'high', 'in_progress'),
        (org_id, 'chatbot facebook', 'chatbot', 590, 'medium', 'medium', 'not_started'),
        (org_id, 'ai chatbot', 'chatbot', 720, 'high', 'medium', 'not_started'),
        (org_id, 'thiet ke logo', 'studio', 1900, 'high', 'low', 'not_started'),
        (org_id, 'anh the online', 'studio', 480, 'low', 'medium', 'not_started'),
        (org_id, 'crm SaaS', 'crm_saas', 590, 'medium', 'medium', 'not_started'),
        (org_id, 'top 10 website design', 'website_design', 170, 'low', 'low', 'not_started'),
        (org_id, 'hanoi web design', 'website_design', 90, 'low', 'low', 'not_started');
    
    -- Marketing Channels
    INSERT INTO strategy_marketing_channels (organization_id, channel_name, channel_type, cac_target, ltv_target, ltv_cac_ratio_target, budget_monthly, leads_target) VALUES
        (org_id, 'Facebook Ads', 'facebook_ads', 1000000, 30000000, 30.00, 4000000, 50),
        (org_id, 'Google Ads', 'google_ads', 1250000, 30000000, 24.00, 5000000, 30),
        (org_id, 'Cold Outreach', 'cold_outreach', 300000, 15000000, 50.00, 2000000, 40),
        (org_id, 'Referral', 'referral', 500000, 25000000, 50.00, 0, 10),
        (org_id, 'SEO Organic', 'seo_organic', 833000, 25000000, 30.00, 3000000, 60);
END $$;
