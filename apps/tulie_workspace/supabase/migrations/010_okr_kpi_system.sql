-- Migration: 010_okr_kpi_system.sql
-- Description: Implement hierarchical OKR/KPI system with operational alignment
-- Date: 2026-05-09

-- 1. Departments Hierarchy
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    manager_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Update user_profiles to link with departments
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES departments(id) ON DELETE SET NULL;

-- 3. OKR Objectives
CREATE TYPE okr_level AS ENUM ('company', 'department', 'team', 'individual');

CREATE TABLE IF NOT EXISTS objectives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    cycle_id UUID REFERENCES cycles(id) ON DELETE SET NULL, -- Link to 12-week cycles
    level okr_level NOT NULL DEFAULT 'individual',
    parent_objective_id UUID REFERENCES objectives(id) ON DELETE SET NULL, -- Alignment
    
    title VARCHAR(500) NOT NULL,
    description TEXT,
    
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    
    status VARCHAR(50) DEFAULT 'active', -- active, achieved, at_risk, cancelled
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Key Results
CREATE TABLE IF NOT EXISTS key_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    objective_id UUID NOT NULL REFERENCES objectives(id) ON DELETE CASCADE,
    
    title VARCHAR(500) NOT NULL,
    description TEXT,
    
    initial_value DECIMAL(12,2) DEFAULT 0.00,
    current_value DECIMAL(12,2) DEFAULT 0.00,
    target_value DECIMAL(12,2) NOT NULL,
    unit VARCHAR(50) DEFAULT '%',
    
    weight DECIMAL(3,2) DEFAULT 1.00,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. KR Operational Links (Connect to Projects/Tasks)
CREATE TABLE IF NOT EXISTS kr_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_result_id UUID NOT NULL REFERENCES key_results(id) ON DELETE CASCADE,
    
    linked_item_type VARCHAR(50) NOT NULL, -- 'project', 'task'
    linked_item_id UUID NOT NULL,
    
    contribution_weight DECIMAL(3,2) DEFAULT 1.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. RLS Policies
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE key_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE kr_links ENABLE ROW LEVEL SECURITY;

-- Departments: Org members can see
CREATE POLICY "Org members can read departments" ON departments
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));

-- Objectives: 
-- 1. Everyone in org can see company/dept objectives
-- 2. Individuals see their own and their teams
CREATE POLICY "Org members can read objectives" ON objectives
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));

-- Insert/Update: Owners and Managers
CREATE POLICY "Owners and managers can manage objectives" ON objectives
  FOR ALL USING (
    owner_id = auth.uid() 
    OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role_type IN ('admin', 'manager'))
  );

-- Key Results: Inherit from objective
CREATE POLICY "Inherit read from objective" ON key_results
  FOR SELECT USING (EXISTS (SELECT 1 FROM objectives WHERE id = key_results.objective_id));

CREATE POLICY "Inherit manage from objective" ON key_results
  FOR ALL USING (EXISTS (SELECT 1 FROM objectives WHERE id = key_results.objective_id AND (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role_type IN ('admin', 'manager')))));

-- 7. Trigger to auto-update Objective progress from Key Results
CREATE OR REPLACE FUNCTION update_objective_progress()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE objectives
    SET progress_percentage = (
        SELECT COALESCE(SUM(
            CASE 
                WHEN target_value = initial_value THEN 0
                ELSE ((current_value - initial_value) / (target_value - initial_value)) * 100 * weight
            END
        ) / NULLIF(SUM(weight), 0), 0)
        FROM key_results
        WHERE objective_id = NEW.objective_id
    )
    WHERE id = NEW.objective_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_objective_progress
AFTER INSERT OR UPDATE ON key_results
FOR EACH ROW EXECUTE PROCEDURE update_objective_progress();
