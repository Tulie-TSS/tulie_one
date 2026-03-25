// POST /api/n8n/fb-alert — Called by n8n AI workflow to create alerts
// n8n analyzes metrics → if CPR too high, creates alert + optionally pauses campaign

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface AlertRequest {
    campaign_id: string;
    campaign_name: string;
    alert_type: "cpr_high" | "budget_depleted" | "low_ctr" | "frequency_high" | "no_results" | "cost_spike";
    severity: "info" | "warning" | "critical";
    message: string;
    value: number;
    threshold: number;
    auto_action?: {
        action: "pause_campaign" | "decrease_budget" | "adjust_audience";
        details: Record<string, any>;
    };
}

export async function POST(request: NextRequest) {
    const authHeader = request.headers.get("Authorization");
    const apiKey = process.env.N8N_WEBHOOK_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!authHeader || authHeader !== `Bearer ${apiKey}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body: AlertRequest = await request.json();
        const wf = createAdminClient();

        // 1. Create alert
        const { data: alert, error: alertErr } = await wf
            .from("fb_alerts")
            .insert({
                campaign_id: body.campaign_id,
                campaign_name: body.campaign_name,
                alert_type: body.alert_type,
                severity: body.severity,
                message: body.message,
                value: body.value,
                threshold: body.threshold,
                is_read: false,
                action_taken: body.auto_action 
                    ? `Auto: ${body.auto_action.action}` 
                    : null,
            })
            .select()
            .single();

        if (alertErr) throw alertErr;

        // 2. If auto_action, execute it
        if (body.auto_action && body.severity === "critical") {
            // Log the agent action
            await wf.from("agent_alerts").insert({
                campaign_id: body.campaign_id,
                campaign_name: body.campaign_name,
                action: body.auto_action.action,
                reason: body.message,
                details: body.auto_action.details,
                status: "executed",
            });

            // If pause_campaign, update status
            if (body.auto_action.action === "pause_campaign") {
                await wf
                    .from("fb_campaigns")
                    .update({ status: "paused" })
                    .eq("id", body.campaign_id);
            }
        }

        return NextResponse.json({
            success: true,
            alert_id: alert.id,
            auto_action_executed: !!body.auto_action,
        });
    } catch (error) {
        console.error("[n8n/fb-alert] Error:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
