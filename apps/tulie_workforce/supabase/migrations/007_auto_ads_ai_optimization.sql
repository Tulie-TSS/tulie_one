-- Auto Ads & AI Optimization Tables
-- Migration: 007_auto_ads_ai_optimization

-- Recommendation Type ENUM
CREATE TYPE recommendation_type AS ENUM (
    'increase_budget',
    'decrease_budget',
    'pause_campaign',
    'resume_campaign',
    'adjust_audience',
    'optimize_bid',
    'create_new_creative',
    'test_different_copy',
    'lower_cpr_target',
    'raise_cpr_target'
);

-- Recommendation Status ENUM
CREATE TYPE recommendation_status AS ENUM ('pending', 'approved', 'rejected', 'executed');

-- Rule Trigger ENUM
CREATE TYPE rule_trigger AS ENUM ('keyword', 'intent', 'first_message', 'no_response', 'time_based');

-- Rule Action ENUM
CREATE TYPE rule_action AS ENUM ('reply', 'tag', 'assign', 'escalate', 'auto_resolve');

-- AI Settings
CREATE TABLE ai_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    auto_execution_enabled BOOLEAN DEFAULT FALSE,
    max_budget_increase_percent INTEGER DEFAULT 20,
    max_budget_decrease_percent INTEGER DEFAULT 50,
    cpr_threshold_multiplier DECIMAL DEFAULT 1.5,
    daily_analysis_enabled BOOLEAN DEFAULT TRUE,
    notification_email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id)
);

-- Recommendations
CREATE TABLE recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    type recommendation_type NOT NULL,
    reason TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    status recommendation_status DEFAULT 'pending',
    priority INTEGER DEFAULT 0,
    is_auto_exec BOOLEAN DEFAULT FALSE,
    executed_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id),
    approved_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto Reply Rules
CREATE TABLE auto_reply_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    trigger_type rule_trigger NOT NULL,
    trigger_config JSONB NOT NULL,
    actions JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Response Templates
CREATE TABLE response_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT,
    content TEXT NOT NULL,
    variables JSONB DEFAULT '[]',
    ai_prompt TEXT,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_recommendations_campaign ON recommendations(campaign_id);
CREATE INDEX idx_recommendations_status ON recommendations(status);
CREATE INDEX idx_recommendations_org ON recommendations(organization_id);
CREATE INDEX idx_recommendations_created ON recommendations(created_at DESC);
CREATE INDEX idx_auto_reply_rules_org ON auto_reply_rules(organization_id);
CREATE INDEX idx_auto_reply_rules_active ON auto_reply_rules(is_active);
CREATE INDEX idx_response_templates_org ON response_templates(organization_id);
CREATE INDEX idx_response_templates_category ON response_templates(category);
CREATE INDEX idx_ai_settings_org ON ai_settings(organization_id);

-- Row Level Security
ALTER TABLE ai_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_reply_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE response_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_settings
CREATE POLICY "Users can view ai_settings of own org"
    ON ai_settings FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id FROM profiles
            WHERE profiles.id = auth.uid()
        )
    );

CREATE POLICY "Users can insert ai_settings for own org"
    ON ai_settings FOR INSERT
    WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM profiles
            WHERE profiles.id = auth.uid()
        )
    );

CREATE POLICY "Users can update ai_settings for own org"
    ON ai_settings FOR UPDATE
    USING (
        organization_id IN (
            SELECT organization_id FROM profiles
            WHERE profiles.id = auth.uid()
        )
    );

-- RLS Policies for recommendations
CREATE POLICY "Users can view recommendations of own org"
    ON recommendations FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id FROM profiles
            WHERE profiles.id = auth.uid()
        )
    );

CREATE POLICY "Users can insert recommendations for own campaigns"
    ON recommendations FOR INSERT
    WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM profiles
            WHERE profiles.id = auth.uid()
        )
    );

CREATE POLICY "Users can update recommendations of own org"
    ON recommendations FOR UPDATE
    USING (
        organization_id IN (
            SELECT organization_id FROM profiles
            WHERE profiles.id = auth.uid()
        )
    );

CREATE POLICY "Users can delete recommendations of own org"
    ON recommendations FOR DELETE
    USING (
        organization_id IN (
            SELECT organization_id FROM profiles
            WHERE profiles.id = auth.uid()
        )
    );

-- RLS Policies for auto_reply_rules
CREATE POLICY "Users can view auto_reply_rules of own org"
    ON auto_reply_rules FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id FROM profiles
            WHERE profiles.id = auth.uid()
        )
    );

CREATE POLICY "Users can insert auto_reply_rules for own org"
    ON auto_reply_rules FOR INSERT
    WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM profiles
            WHERE profiles.id = auth.uid()
        )
    );

CREATE POLICY "Users can update auto_reply_rules of own org"
    ON auto_reply_rules FOR UPDATE
    USING (
        organization_id IN (
            SELECT organization_id FROM profiles
            WHERE profiles.id = auth.uid()
        )
    );

CREATE POLICY "Users can delete auto_reply_rules of own org"
    ON auto_reply_rules FOR DELETE
    USING (
        organization_id IN (
            SELECT organization_id FROM profiles
            WHERE profiles.id = auth.uid()
        )
    );

-- RLS Policies for response_templates
CREATE POLICY "Users can view response_templates of own org"
    ON response_templates FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id FROM profiles
            WHERE profiles.id = auth.uid()
        )
    );

CREATE POLICY "Users can insert response_templates for own org"
    ON response_templates FOR INSERT
    WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM profiles
            WHERE profiles.id = auth.uid()
        )
    );

CREATE POLICY "Users can update response_templates of own org"
    ON response_templates FOR UPDATE
    USING (
        organization_id IN (
            SELECT organization_id FROM profiles
            WHERE profiles.id = auth.uid()
        )
    );

CREATE POLICY "Users can delete response_templates of own org"
    ON response_templates FOR DELETE
    USING (
        organization_id IN (
            SELECT organization_id FROM profiles
            WHERE profiles.id = auth.uid()
        )
    );

-- Triggers for updated_at
CREATE TRIGGER update_ai_settings_updated_at
    BEFORE UPDATE ON ai_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recommendations_updated_at
    BEFORE UPDATE ON recommendations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_auto_reply_rules_updated_at
    BEFORE UPDATE ON auto_reply_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_response_templates_updated_at
    BEFORE UPDATE ON response_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
