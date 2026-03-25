// GET /api/n8n/overdue — Called by n8n daily cron to check overdue tasks
// Returns list of overdue workspace tasks for notification/alert

import { NextRequest, NextResponse } from "next/server";
import { createWorkspaceAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
    // Auth check
    const authHeader = request.headers.get("Authorization");
    const apiKey = process.env.N8N_WEBHOOK_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!authHeader || authHeader !== `Bearer ${apiKey}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const ws = createWorkspaceAdminClient();
        const now = new Date().toISOString();

        const { data: overdueTasks, error } = await ws
            .from("tasks")
            .select("id, title, due_date, assigned_to, status, crm_order_code, crm_customer_name")
            .lt("due_date", now)
            .not("status", "in", '("done","cancelled")')
            .order("due_date", { ascending: true })
            .limit(50);

        if (error) throw error;

        // Enrich with days overdue
        const tasks = (overdueTasks || []).map((t) => ({
            ...t,
            days_overdue: Math.floor(
                (Date.now() - new Date(t.due_date).getTime()) / (1000 * 60 * 60 * 24)
            ),
        }));

        return NextResponse.json({
            count: tasks.length,
            tasks,
            checked_at: now,
        });
    } catch (error) {
        console.error("[n8n/overdue] Error:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
