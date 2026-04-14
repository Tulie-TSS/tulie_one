-- Workforce FB Ads Management System
-- Migration: 001_fb_ads_initial

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Campaign Objectives ENUM
CREATE TYPE campaign_objective AS ENUM (
    'LEAD_GENERATION',
    'CONVERSIONS',
    'TRAFFIC',
    'MESSAGES',
    'REACH',
    'BRAND_AWARENESS',
    'POST_ENGAGEMENT',
    'VIDEO_VIEWS'
);

-- Campaign Status ENUM
CREATE TYPE campaign_status AS ENUM ('active', 'paused', 'completed', 'draft', 'error');

-- Creative Type ENUM
CREATE TYPE creative_type AS ENUM ('image', 'video', 'carousel', 'collection');

-- FB Ad Account Status ENUM
CREATE TYPE fb_ad_account_status AS ENUM ('active', 'disconnected', 'error');

-- FB Ad Accounts
CREATE TABLE fb_ad_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    fb_account_id TEXT NOT NULL,
    fb_account_name TEXT,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_expires_at TIMESTAMPTZ,
    status fb_ad_account_status DEFAULT 'active',
    daily_budget_limit DECIMAL DEFAULT 0,
    currency TEXT DEFAULT 'VND',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, fb_account_id)
);

-- FB Pages
CREATE TABLE fb_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fb_ad_account_id UUID REFERENCES fb_ad_accounts(id) ON DELETE CASCADE,
    fb_page_id TEXT NOT NULL,
    page_name TEXT,
    access_token TEXT NOT NULL,
    follower_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(fb_ad_account_id, fb_page_id)
);

-- Campaigns
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fb_ad_account_id UUID REFERENCES fb_ad_accounts(id) ON DELETE CASCADE,
    fb_campaign_id TEXT,
    name TEXT NOT NULL,
    objective campaign_objective DEFAULT 'LEAD_GENERATION',
    status campaign_status DEFAULT 'draft',
    daily_budget DECIMAL DEFAULT 0,
    lifetime_budget DECIMAL,
    cpr_target DECIMAL DEFAULT 0,
    start_date DATE,
    end_date DATE,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ad Sets
CREATE TABLE ad_sets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    fb_adset_id TEXT,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    daily_budget DECIMAL DEFAULT 0,
    targeting JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ads
CREATE TABLE ads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    adset_id UUID REFERENCES ad_sets(id) ON DELETE CASCADE,
    fb_ad_id TEXT,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    creative_type creative_type DEFAULT 'image',
    creative_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaign Metrics
CREATE TABLE campaign_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    spent DECIMAL DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    reach INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    ctr DECIMAL DEFAULT 0,
    cpc DECIMAL DEFAULT 0,
    results INTEGER DEFAULT 0,
    cpr DECIMAL DEFAULT 0,
    frequency DECIMAL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(campaign_id, date)
);

-- Indexes
CREATE INDEX idx_campaigns_account ON campaigns(fb_ad_account_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_ad_sets_campaign ON ad_sets(campaign_id);
CREATE INDEX idx_ads_adset ON ads(adset_id);
CREATE INDEX idx_metrics_campaign ON campaign_metrics(campaign_id, date DESC);
CREATE INDEX idx_fb_accounts_org ON fb_ad_accounts(organization_id);

-- Row Level Security
ALTER TABLE fb_ad_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE fb_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for fb_ad_accounts
CREATE POLICY "Users can view own organization accounts"
    ON fb_ad_accounts FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id FROM profiles
            WHERE profiles.id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own organization accounts"
    ON fb_ad_accounts FOR INSERT
    WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM profiles
            WHERE profiles.id = auth.uid()
        )
    );

CREATE POLICY "Users can update own organization accounts"
    ON fb_ad_accounts FOR UPDATE
    USING (
        organization_id IN (
            SELECT organization_id FROM profiles
            WHERE profiles.id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own organization accounts"
    ON fb_ad_accounts FOR DELETE
    USING (
        organization_id IN (
            SELECT organization_id FROM profiles
            WHERE profiles.id = auth.uid()
        )
    );

-- RLS Policies for fb_pages
CREATE POLICY "Users can view pages of own accounts"
    ON fb_pages FOR SELECT
    USING (
        fb_ad_account_id IN (
            SELECT id FROM fb_ad_accounts
            WHERE organization_id IN (
                SELECT organization_id FROM profiles
                WHERE profiles.id = auth.uid()
            )
        )
    );

-- RLS Policies for campaigns
CREATE POLICY "Users can view campaigns of own accounts"
    ON campaigns FOR SELECT
    USING (
        fb_ad_account_id IN (
            SELECT id FROM fb_ad_accounts
            WHERE organization_id IN (
                SELECT organization_id FROM profiles
                WHERE profiles.id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can insert campaigns"
    ON campaigns FOR INSERT
    WITH CHECK (
        fb_ad_account_id IN (
            SELECT id FROM fb_ad_accounts
            WHERE organization_id IN (
                SELECT organization_id FROM profiles
                WHERE profiles.id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can update campaigns"
    ON campaigns FOR UPDATE
    USING (
        fb_ad_account_id IN (
            SELECT id FROM fb_ad_accounts
            WHERE organization_id IN (
                SELECT organization_id FROM profiles
                WHERE profiles.id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can delete campaigns"
    ON campaigns FOR DELETE
    USING (
        fb_ad_account_id IN (
            SELECT id FROM fb_ad_accounts
            WHERE organization_id IN (
                SELECT organization_id FROM profiles
                WHERE profiles.id = auth.uid()
            )
        )
    );

-- RLS Policies for ad_sets
CREATE POLICY "Users can manage ad_sets of own campaigns"
    ON ad_sets FOR ALL
    USING (
        campaign_id IN (
            SELECT id FROM campaigns
            WHERE fb_ad_account_id IN (
                SELECT id FROM fb_ad_accounts
                WHERE organization_id IN (
                    SELECT organization_id FROM profiles
                    WHERE profiles.id = auth.uid()
                )
            )
        )
    );

-- RLS Policies for ads
CREATE POLICY "Users can manage ads of own ad_sets"
    ON ads FOR ALL
    USING (
        adset_id IN (
            SELECT id FROM ad_sets
            WHERE campaign_id IN (
                SELECT id FROM campaigns
                WHERE fb_ad_account_id IN (
                    SELECT id FROM fb_ad_accounts
                    WHERE organization_id IN (
                        SELECT organization_id FROM profiles
                        WHERE profiles.id = auth.uid()
                    )
                )
            )
        )
    );

-- RLS Policies for campaign_metrics
CREATE POLICY "Users can view metrics of own campaigns"
    ON campaign_metrics FOR SELECT
    USING (
        campaign_id IN (
            SELECT id FROM campaigns
            WHERE fb_ad_account_id IN (
                SELECT id FROM fb_ad_accounts
                WHERE organization_id IN (
                    SELECT organization_id FROM profiles
                    WHERE profiles.id = auth.uid()
                )
            )
        )
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_fb_ad_accounts_updated_at
    BEFORE UPDATE ON fb_ad_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at
    BEFORE UPDATE ON campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ad_sets_updated_at
    BEFORE UPDATE ON ad_sets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ads_updated_at
    BEFORE UPDATE ON ads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
