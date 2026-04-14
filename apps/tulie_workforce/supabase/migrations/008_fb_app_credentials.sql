-- Add Facebook App credentials to ai_settings
-- Migration: 008_fb_app_credentials

ALTER TABLE ai_settings
ADD COLUMN fb_app_id TEXT,
ADD COLUMN fb_app_secret TEXT,
ADD COLUMN fb_redirect_uri TEXT;

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