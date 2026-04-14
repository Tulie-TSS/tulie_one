import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getFBClient } from "@/lib/fb/client";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: adSet, error } = await supabase
      .from("ad_sets")
      .select("*, campaign:campaigns(*), ads(*)")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching ad set:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!adSet) {
      return NextResponse.json({ error: "Ad set not found" }, { status: 404 });
    }

    return NextResponse.json({ data: adSet });
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

    const { data: adSet } = await supabase
      .from("ad_sets")
      .select("fb_adset_id, campaigns(fb_ad_accounts(access_token))")
      .eq("id", id)
      .single();

    if (!adSet) {
      return NextResponse.json({ error: "Ad set not found" }, { status: 404 });
    }

    const updates: Record<string, unknown> = {};
    const fbUpdates: Record<string, unknown> = {};

    if (body.name) updates.name = body.name;
    if (body.status) {
      updates.status = body.status;
      fbUpdates.status = body.status === "active" ? "ACTIVE" : "PAUSED";
    }
    if (body.daily_budget !== undefined) {
      updates.daily_budget = body.daily_budget;
      fbUpdates.daily_budget = Math.round(body.daily_budget * 100);
    }
    if (body.targeting !== undefined) updates.targeting = body.targeting;

    if (adSet.fb_adset_id && Object.keys(fbUpdates).length > 0) {
      const campaign = adSet.campaigns as {
        fb_ad_accounts: { access_token: string };
      };
      const fbClient = getFBClient(campaign.fb_ad_accounts.access_token);
      await fbClient.updateAdSet(adSet.fb_adset_id, fbUpdates);
    }

    const { data: updated, error } = await supabase
      .from("ad_sets")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating ad set:", error);
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

    const { data: adSet } = await supabase
      .from("ad_sets")
      .select("fb_adset_id, campaigns(fb_ad_accounts(access_token))")
      .eq("id", id)
      .single();

    if (!adSet) {
      return NextResponse.json({ error: "Ad set not found" }, { status: 404 });
    }

    if (adSet.fb_adset_id) {
      const campaign = adSet.campaigns as {
        fb_ad_accounts: { access_token: string };
      };
      const fbClient = getFBClient(campaign.fb_ad_accounts.access_token);
      await fbClient.updateAdSet(adSet.fb_adset_id, { status: "DELETED" });
    }

    const { error } = await supabase.from("ad_sets").delete().eq("id", id);

    if (error) {
      console.error("Error deleting ad set:", error);
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
