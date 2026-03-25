// ============================================
// Approvals API — Task Approval Workflow
// GET:    List pending approvals
// PATCH:  Approve / Reject / Request changes
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/roles";
import type { ApprovalStatus, TaskStatus as DBTaskStatus } from "@/types/database";

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Only managers and owners can view approvals
        const roleInfo = await getUserRole(user.id);
        if (roleInfo.role !== "owner" && roleInfo.role !== "manager") {
            return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status") ?? "pending_review";

        let query = supabase
            .from("tasks")
            .select(`
                id,
                title,
                description,
                priority,
                status,
                approval_status,
                feedback_note,
                created_at,
                result,
                user:profiles!tasks_user_id_fkey(id, full_name, email, avatar_url),
                agent:agents!tasks_agent_id_fkey(id, name, role)
            `)
            .not("approval_status", "is", null)
            .order("created_at", { ascending: false });

        if (status !== "all") {
            query = query.eq("approval_status", status);
        }

        if (roleInfo.organizationId) {
            query = query.eq("organization_id", roleInfo.organizationId);
        }

        const { data, error } = await query;

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ approvals: data ?? [] });
    } catch (error) {
        console.error("[Approvals API] GET error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Only managers and owners can approve
        const roleInfo = await getUserRole(user.id);
        if (roleInfo.role !== "owner" && roleInfo.role !== "manager") {
            return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
        }

        const body = await request.json();
        const {
            taskId,
            action,
            feedbackNote,
        }: {
            taskId: string;
            action: "approve" | "reject" | "request_changes";
            feedbackNote?: string;
        } = body;

        if (!taskId || !action) {
            return NextResponse.json(
                { error: "taskId and action required" },
                { status: 400 }
            );
        }

        const statusMap: Record<string, ApprovalStatus> = {
            approve: "approved",
            reject: "rejected",
            request_changes: "changes_requested",
        };

        const taskStatusMap: Record<string, DBTaskStatus> = {
            approve: "completed",
            reject: "failed",
            request_changes: "in_progress",
        };

        const { error } = await supabase
            .from("tasks")
            .update({
                approval_status: statusMap[action],
                feedback_note: feedbackNote ?? null,
                approver_id: user.id,
                status: taskStatusMap[action],
                updated_at: new Date().toISOString(),
            })
            .eq("id", taskId);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            taskId,
            approvalStatus: statusMap[action],
            taskStatus: taskStatusMap[action],
        });
    } catch (error) {
        console.error("[Approvals API] PATCH error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
