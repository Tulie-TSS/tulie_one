import { createClient } from "@supabase/supabase-js";

/**
 * Admin client for Workforce schema — bypasses RLS.
 * Use this for:
 * - n8n webhook handlers
 * - AI Agent background tasks
 * - Cron jobs
 * - Any server-side operation that doesn't have a user session
 */
export function createAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceRoleKey) {
        throw new Error("Supabase admin environment variables are missing");
    }

    return createClient(url, serviceRoleKey, {
        db: {
            schema: "workforce",
        },
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}

/**
 * Admin client for CRM schema (public) — bypasses RLS.
 * Use this when AI agents need to read/write CRM data directly.
 * 
 * Example: Read all overdue orders, create leads from chatbot webhook
 */
export function createCrmAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceRoleKey) {
        throw new Error("Supabase admin environment variables are missing");
    }

    return createClient(url, serviceRoleKey, {
        db: {
            schema: "public",
        },
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}

/**
 * Admin client for Workspace schema — bypasses RLS.
 * Use this when AI agents need to create/update workspace tasks.
 * 
 * Example: Auto-create tasks when CRM order is confirmed
 */
export function createWorkspaceAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceRoleKey) {
        throw new Error("Supabase admin environment variables are missing");
    }

    return createClient(url, serviceRoleKey, {
        db: {
            schema: "workspace",
        },
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}
