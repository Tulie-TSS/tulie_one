-- Migration: 008_add_workspace_resources.sql
-- Description: Table for storing external resource links (Google Sheets, Calendar, etc.)
-- Date: 2026-05-08

CREATE TYPE resource_type AS ENUM ('google_sheets', 'google_calendar', 'lark', 'excel_online', 'other');

CREATE TABLE workspace_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    type resource_type NOT NULL DEFAULT 'other',
    icon_url TEXT,
    is_embedded BOOLEAN DEFAULT true,
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE workspace_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view resources of their organization" 
    ON workspace_resources FOR SELECT 
    USING (organization_id = (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Admins, Managers and Makers can manage resources" 
    ON workspace_resources FOR ALL 
    USING (
        organization_id = (SELECT organization_id FROM user_profiles WHERE id = auth.uid())
        AND (SELECT role_type FROM user_profiles WHERE id = auth.uid()) IN ('admin', 'manager', 'maker')
    );

-- Initial Data
INSERT INTO workspace_resources (organization_id, name, url, type, is_embedded) 
VALUES (
    'a0000000-0000-0000-0000-000000000001', 
    'Lịch làm việc chung', 
    'https://calendar.google.com/calendar/embed?src=address-placeholder', 
    'google_calendar', 
    true
);
