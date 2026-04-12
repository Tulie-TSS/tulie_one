-- ============================================
-- MIGRATION: Refactor Cross-Schema Triggers
-- Date: 2026-04-12
-- 
-- Purpose: Reorganize triggers to follow "trigger in source schema" convention
-- 
-- Convention:
--   - Triggers that fire on schema A and write to schema B
--     → Function lives in A, Trigger lives in A
--   - Internal triggers (fire and write in same schema)
--     → Function and trigger both in that schema
-- 
-- This migration adds NEW properly-placed triggers.
-- The OLD triggers remain until verified working.
-- ============================================

-- ============================================
-- 1. CRM → Workspace: Order Confirmed
-- 
-- OLD (workspace schema): workspace.on_crm_order_confirmed() 
--   Trigger on: public.work_items
--   → Function was in workspace, trigger in public (via DO$$ block)
-- 
-- NEW: Function in public (source), trigger in public
-- ============================================

CREATE OR REPLACE FUNCTION crm.sync_workspace_on_order_confirmed()
RETURNS TRIGGER AS $$
DECLARE
    ws_project_id UUID;
    task_prefix TEXT;
BEGIN
    -- Only trigger on status change TO 'confirmed' or 'in_progress'
    IF NEW.status NOT IN ('confirmed', 'in_progress') THEN
        RETURN NEW;
    END IF;
    
    -- Skip if status didn't change
    IF OLD.status = NEW.status THEN
        RETURN NEW;
    END IF;

    -- Find workspace project linked to CRM project
    IF NEW.project_id IS NOT NULL THEN
        SELECT id INTO ws_project_id 
        FROM workspace.projects 
        WHERE crm_project_id = NEW.project_id 
        LIMIT 1;
    END IF;

    task_prefix := COALESCE(NEW.title, 'Đơn hàng #' || COALESCE(NEW.order_code, NEW.id::text));

    -- Create follow-up tasks in workspace
    INSERT INTO workspace.tasks (title, description, status, priority, due_date, 
        crm_project_id, crm_order_code, crm_customer_name, project_id, category, assigned_to)
    VALUES 
        (
            '📋 Xác nhận yêu cầu: ' || task_prefix,
            'Liên hệ khách hàng xác nhận chi tiết yêu cầu.',
            'ready', 'high',
            NOW() + INTERVAL '1 day',
            NEW.project_id, NEW.order_code, NULL, ws_project_id, 
            'follow_up', NEW.assigned_to
        ),
        (
            '🔨 Bắt đầu sản xuất: ' || task_prefix,
            'Bắt đầu thực hiện đơn hàng.',
            'backlog', 'medium',
            NOW() + INTERVAL '3 days',
            NEW.project_id, NEW.order_code, NULL, ws_project_id,
            'internal', NEW.assigned_to
        ),
        (
            '✅ Kiểm tra & bàn giao: ' || task_prefix,
            'Kiểm tra chất lượng và bàn giao sản phẩm.',
            'backlog', 'medium',
            NEW.due_date,
            NEW.project_id, NEW.order_code, NULL, ws_project_id,
            'follow_up', NEW.assigned_to
        );

    -- Create notification
    IF NEW.assigned_to IS NOT NULL THEN
        INSERT INTO workspace.notifications (user_id, title, content, type)
        VALUES (
            NEW.assigned_to,
            '📦 Đơn hàng mới được xác nhận',
            task_prefix || ' — 3 công việc đã được tạo tự động.',
            'success'
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger in PUBLIC (source schema)
-- Check if work_items table exists first
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'work_items') THEN
        -- Drop old trigger if exists (from previous migration)
        DROP TRIGGER IF EXISTS trigger_crm_order_to_workspace ON public.work_items;
        
        -- Create new trigger in source schema (public)
        CREATE TRIGGER crm_trigger_order_to_workspace
            AFTER UPDATE OF status ON public.work_items
            FOR EACH ROW
            EXECUTE FUNCTION crm.sync_workspace_on_order_confirmed();
        
        RAISE NOTICE 'New trigger crm_trigger_order_to_workspace created on public.work_items';
    ELSE
        RAISE NOTICE 'Table public.work_items does not exist, skipping trigger creation';
    END IF;
END $$;


-- ============================================
-- 2. Workspace Internal: Task Completion
-- 
-- This trigger stays in workspace schema (internal)
-- ============================================

-- Already exists in workspace schema: workspace.on_task_completed()
-- Trigger: trigger_ws_task_completion on workspace.tasks
-- No changes needed - this is correctly placed


-- ============================================
-- 3. Workforce Internal: FB Alert
-- 
-- This trigger stays in workforce schema (internal)
-- ============================================

-- Already exists in workforce schema: workforce.on_fb_alert_created()
-- Trigger: trigger_fb_alert_to_workspace on workforce.fb_alerts
-- No changes needed - this is correctly placed


-- ============================================
-- 4. Add comment documenting schema ownership
-- ============================================

COMMENT ON FUNCTION crm.sync_workspace_on_order_confirmed() IS 
    'Trigger function: When CRM work_item is confirmed, create tasks in workspace. 
     Owner: tulie_crm (source schema)
     Target: workspace schema';

-- ============================================
-- Verification: List all triggers
-- ============================================

-- Run this to verify triggers:
-- SELECT 
--     trigger_schema,
--     trigger_name, 
--     event_object_schema,
--     event_object_table,
--     action_statement
-- FROM information_schema.triggers
-- WHERE trigger_name LIKE '%workspace%' OR trigger_name LIKE '%crm%' OR trigger_name LIKE '%fb%'
-- ORDER BY event_object_schema, trigger_name;

-- ============================================
-- ROLLBACK INSTRUCTIONS
-- 
-- If issues arise, drop the new trigger:
-- DROP TRIGGER IF EXISTS crm_trigger_order_to_workspace ON public.work_items;
-- DROP FUNCTION IF EXISTS crm.sync_workspace_on_order_confirmed();
-- 
-- The OLD trigger/function should still exist:
-- DROP TRIGGER IF EXISTS trigger_crm_order_to_workspace ON public.work_items;
-- DROP FUNCTION IF EXISTS workspace.on_crm_order_confirmed();
-- ============================================