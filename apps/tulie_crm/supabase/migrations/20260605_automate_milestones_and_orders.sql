-- =========================================================================
-- MIGRATION: Drop auto-sync triggers (using manual/selective Next.js Server Actions instead)
-- Date: 2026-06-05
-- Description: Drops automatic sync triggers to support user-initiated selective sync.
-- =========================================================================

-- Drop milestone sync trigger and function
DROP TRIGGER IF EXISTS trigger_sync_milestone_to_task ON public.contract_milestones;
DROP FUNCTION IF EXISTS workspace.sync_contract_milestones_to_tasks();

-- Drop retail order sync trigger and function
DROP TRIGGER IF EXISTS trigger_retail_order_to_workspace ON public.retail_orders;
DROP FUNCTION IF EXISTS workspace.on_retail_order_created_or_updated();
