import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getFBClient } from "@/lib/fb/client";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: ad, error } = await supabase
      .from("ads")
      .select("*, ad_sets(campaigns(fb_ad_accounts(access_token)))")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching ad:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!ad) {
      return NextResponse.json({ error: "Ad not found" }, { status: 404 });
    }

    return NextResponse.json({ data: ad });
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

    const { data: ad } = await supabase
      .from("ads")
      .select("fb_ad_id, ad_sets(campaigns(fb_ad_accounts(access_token)))")
      .eq("id", id)
      .single();

    if (!ad) {
      return NextResponse.json({ error: "Ad not found" }, { status: 404 });
    }

    const updates: Record<string, unknown> = {};
    const fbUpdates: Record<string, unknown> = {};

    if (body.name) updates.name = body.name;
    if (body.status) {
      updates.status = body.status;
      fbUpdates.status = body.status === "active" ? "ACTIVE" : "PAUSED";
    }
    if (body.creative_data) updates.creative_data = body.creative_data;

    if (ad.fb_ad_id && Object.keys(fbUpdates).length > 0) {
      const campaign = ad.ad_sets.campaigns as {
        fb_ad_accounts: { access_token: string };
      };
      const fbClient = getFBClient(campaign.fb_ad_accounts.access_token);
      await fbClient.updateAd(ad.fb_ad_id, fbUpdates);
    }

    const { data: updated, error } = await supabase
      .from("ads")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating ad:", error);
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

    const { data: ad } = await supabase
      .from("ads")
      .select("fb_ad_id, ad_sets(campaigns(fb_ad_accounts(access_token)))")
      .eq("id", id)
      .single();

    if (!ad) {
      return NextResponse.json({ error: "Ad not found" }, { status: 404 });
    }

    if (ad.fb_ad_id) {
      const campaign = ad.ad_sets.campaigns as {
        fb_ad_accounts: { access_token: string };
      };
      const fbClient = getFBClient(campaign.fb_ad_accounts.access_token);
      await fbClient.updateAd(ad.fb_ad_id, { status: "DELETED" });
    }

    const { error } = await supabase.from("ads").delete().eq("id", id);

    if (error) {
      console.error("Error deleting ad:", error);
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
