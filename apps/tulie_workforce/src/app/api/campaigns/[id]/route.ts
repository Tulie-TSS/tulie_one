import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getFBClient } from "@/lib/fb/client";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: campaign, error } = await supabase
      .from("campaigns")
      .select(
        `
                *,
                ad_sets (
                    *,
                    ads (*)
                ),
                fb_ad_accounts (*)
            `,
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching campaign:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: campaign });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const body = await request.json();

    const { data: campaign } = await supabase
      .from("campaigns")
      .select(
        "fb_ad_account_id, fb_campaign_id, fb_ad_accounts(access_token, fb_account_id)",
      )
      .eq("id", id)
      .single();

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 },
      );
    }

    const updates: Record<string, unknown> = {};
    const fbUpdates: Record<string, unknown> = {};

    if (body.name) updates.name = body.name;
    if (body.objective) updates.objective = body.objective;
    if (body.status) {
      updates.status = body.status;
      fbUpdates.status = body.status === "active" ? "ACTIVE" : "PAUSED";
    }
    if (body.daily_budget !== undefined) {
      updates.daily_budget = body.daily_budget;
      fbUpdates.daily_budget = Math.round(body.daily_budget * 100);
    }
    if (body.lifetime_budget !== undefined)
      updates.lifetime_budget = body.lifetime_budget;
    if (body.cpr_target !== undefined) updates.cpr_target = body.cpr_target;
    if (body.start_date !== undefined) updates.start_date = body.start_date;
    if (body.end_date !== undefined) updates.end_date = body.end_date;
    if (body.tags !== undefined) updates.tags = body.tags;

    if (campaign.fb_campaign_id && Object.keys(fbUpdates).length > 0) {
      const account = campaign.fb_ad_accounts as {
        access_token: string;
        fb_account_id: string;
      };
      const fbClient = getFBClient(account.access_token);
      await fbClient.updateCampaign(campaign.fb_campaign_id, fbUpdates);
    }

    const { data: updated, error } = await supabase
      .from("campaigns")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating campaign:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: campaign } = await supabase
      .from("campaigns")
      .select("fb_ad_accounts(access_token)")
      .eq("id", id)
      .single();

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 },
      );
    }

    if (campaign.fb_campaign_id) {
      const account = campaign.fb_ad_accounts as { access_token: string };
      const fbClient = getFBClient(account.access_token);
      await fbClient.updateCampaign(campaign.fb_campaign_id, {
        status: "DELETED",
      });
    }

    const { error } = await supabase.from("campaigns").delete().eq("id", id);

    if (error) {
      console.error("Error deleting campaign:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
