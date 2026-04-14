-- Add AI provider configuration to ai_settings
ALTER TABLE ai_settings
ADD COLUMN ai_provider TEXT DEFAULT 'openai',
ADD COLUMN ai_api_key TEXT,
ADD COLUMN ai_model TEXT DEFAULT 'gpt-4o-mini';

-- Update RLS policy to allow updating these new fields
DROP POLICY IF EXISTS "Users can update ai_settings for own org" ON ai_settings;
CREATE POLICY "Users can update ai_settings for own org"
    ON ai_settings FOR UPDATE
    USING (
        organization_id IN (
            SELECT organization_id FROM profiles
            WHERE profiles.id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert ai_settings for own org" ON ai_settings;
CREATE POLICY "Users can insert ai_settings for own org"
    ON ai_settings FOR INSERT
    WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM profiles
            WHERE profiles.id = auth.uid()
        )
    );