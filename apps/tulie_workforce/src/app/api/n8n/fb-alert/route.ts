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
        const body = await request.json();
        const wf = createAdminClient();

        // Support both field names from different workflow versions
        const campaignId = body.campaign_id || body.fb_campaign_id;
        const campaignName = body.campaign_name;
        const alertType = body.alert_type || body.type || "cost_spike";
        const severity = body.severity || "warning";

        // 1. Create alert
        const { data: alert, error: alertErr } = await wf
            .from("fb_alerts")
            .insert({
                campaign_id: campaignId,
                campaign_name: campaignName,
                alert_type: alertType,
                severity: severity,
                message: body.message,
                value: body.value || 0,
                threshold: body.threshold || 0,
                is_read: false,
                action_taken: body.auto_action 
                    ? `Auto: ${typeof body.auto_action === 'string' ? body.auto_action : body.auto_action.action}` 
                    : (body.auto_action === 'pause' ? 'Auto: pause_campaign' : null),
            })
            .select()
            .single();

        if (alertErr) throw alertErr;

        // 2. If auto_action, execute it
        const autoAction = typeof body.auto_action === 'string' 
            ? body.auto_action 
            : body.auto_action?.action;

        if (autoAction && (severity === "critical" || body.auto_action === "pause")) {
            // Log the agent action
            await wf.from("agent_alerts").insert({
                campaign_id: campaignId,
                campaign_name: campaignName,
                action: autoAction === "pause" ? "pause_campaign" : autoAction,
                reason: body.message,
                details: typeof body.auto_action === 'object' ? body.auto_action.details : {},
                status: "executed",
            });

            // If pause_campaign, update status
            if (autoAction === "pause_campaign" || autoAction === "pause") {
                await wf
                    .from("fb_campaigns")
                    .update({ status: "paused" })
                    .eq("fb_campaign_id", campaignId);
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
