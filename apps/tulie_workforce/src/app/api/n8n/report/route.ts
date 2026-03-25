// GET /api/n8n/report — Daily report data for n8n to send via email/Telegram
// Returns today's task stats, overdue items, and active cycle progress

import { NextRequest, NextResponse } from "next/server";
import { createWorkspaceAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
    const authHeader = request.headers.get("Authorization");
    const apiKey = process.env.N8N_WEBHOOK_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!authHeader || authHeader !== `Bearer ${apiKey}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const ws = createWorkspaceAdminClient();
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();

        // Today's completed
        const { count: completedToday } = await ws
            .from("tasks")
            .select("id", { count: "exact", head: true })
            .gte("completed_at", todayStart)
            .lt("completed_at", todayEnd);

        // Currently doing
        const { count: doingNow } = await ws
            .from("tasks")
            .select("id", { count: "exact", head: true })
            .eq("status", "doing");

        // Overdue
        const { data: overdue } = await ws
            .from("tasks")
            .select("id, title, due_date, crm_order_code")
            .lt("due_date", now.toISOString())
            .not("status", "in", '("done","cancelled")')
            .order("due_date", { ascending: true })
            .limit(10);

        // In quarantine
        const { count: quarantine } = await ws
            .from("tasks")
            .select("id", { count: "exact", head: true })
            .eq("status", "quarantine");

        // Active cycle
        const { data: activeCycle } = await ws
            .from("cycles")
            .select("*")
            .eq("status", "active")
            .limit(1)
            .single();

        let cycleProgress = null;
        if (activeCycle) {
            const { count: cycleTasks } = await ws
                .from("tasks")
                .select("id", { count: "exact", head: true })
                .eq("cycle_id", activeCycle.id);
            const { count: cycleDone } = await ws
                .from("tasks")
                .select("id", { count: "exact", head: true })
                .eq("cycle_id", activeCycle.id)
                .eq("status", "done");

            cycleProgress = {
                name: activeCycle.name,
                total: cycleTasks || 0,
                done: cycleDone || 0,
                pct: cycleTasks ? Math.round(((cycleDone || 0) / cycleTasks) * 100) : 0,
                end_date: activeCycle.end_date,
            };
        }

        const report = {
            date: todayStart.split("T")[0],
            completed_today: completedToday || 0,
            doing_now: doingNow || 0,
            overdue_count: overdue?.length || 0,
            overdue_items: overdue || [],
            quarantine_count: quarantine || 0,
            active_cycle: cycleProgress,
            generated_at: now.toISOString(),
        };

        return NextResponse.json(report);
    } catch (error) {
        console.error("[n8n/report] Error:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
