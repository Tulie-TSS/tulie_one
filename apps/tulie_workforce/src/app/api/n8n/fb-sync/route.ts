// POST /api/n8n/fb-sync — Called by n8n to sync FB Ads metrics
// n8n fetches data from Facebook Marketing API, then pushes here

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
    const authHeader = request.headers.get("Authorization");
    const apiKey = process.env.N8N_WEBHOOK_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!authHeader || authHeader !== `Bearer ${apiKey}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { campaigns } = body;

        if (!campaigns || !Array.isArray(campaigns)) {
            return NextResponse.json(
                { error: "campaigns array is required" },
                { status: 400 }
            );
        }

        const wf = createAdminClient();
        const results = { upserted: 0, errors: 0 };

        for (const campaign of campaigns) {
            const { error } = await wf
                .from("fb_campaigns")
                .upsert(
                    {
                        fb_campaign_id: campaign.id,
                        account_id: campaign.account_id,
                        name: campaign.name,
                        objective: campaign.objective,
                        status: campaign.effective_status === "ACTIVE" ? "active" : 
                                campaign.effective_status === "PAUSED" ? "paused" : "completed",
                        daily_budget: parseInt(campaign.daily_budget || "0") / 100,
                        lifetime_budget: campaign.lifetime_budget 
                            ? parseInt(campaign.lifetime_budget) / 100 
                            : null,
                        // Metrics from insights
                        spent: parseFloat(campaign.insights?.spend || "0"),
                        impressions: parseInt(campaign.insights?.impressions || "0"),
                        clicks: parseInt(campaign.insights?.clicks || "0"),
                        reach: parseInt(campaign.insights?.reach || "0"),
                        results: parseInt(campaign.insights?.actions?.[0]?.value || "0"),
                        ctr: parseFloat(campaign.insights?.ctr || "0"),
                        cpc: parseFloat(campaign.insights?.cpc || "0"),
                        cpm: parseFloat(campaign.insights?.cpm || "0"),
                        frequency: parseFloat(campaign.insights?.frequency || "0"),
                        last_synced: new Date().toISOString(),
                    },
                    { onConflict: "fb_campaign_id" }
                );

            if (error) {
                console.error(`[fb-sync] Error upserting campaign ${campaign.id}:`, error);
                results.errors++;
            } else {
                results.upserted++;
            }
        }

        return NextResponse.json({
            success: true,
            ...results,
            synced_at: new Date().toISOString(),
        });
    } catch (error) {
        console.error("[n8n/fb-sync] Error:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
