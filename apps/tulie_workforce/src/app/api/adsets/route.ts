import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getFBClient, buildTargetingForFB } from "@/lib/fb/client";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const campaignId = searchParams.get("campaign_id");

    let query = supabase
      .from("ad_sets")
      .select("*, ads(*)")
      .order("created_at", { ascending: false });

    if (campaignId) {
      query = query.eq("campaign_id", campaignId);
    }

    const { data: adSets, error } = await query;

    if (error) {
      console.error("Error fetching ad sets:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: adSets });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { campaign_id, name, daily_budget, targeting } = body;

    const { data: campaign } = await supabase
      .from("campaigns")
      .select(
        `
                id,
                fb_campaign_id,
                fb_ad_accounts(fb_account_id, access_token)
            `,
      )
      .eq("id", campaign_id)
      .single();

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 },
      );
    }

    const account = campaign.fb_ad_accounts as {
      fb_account_id: string;
      access_token: string;
    };
    const fbClient = getFBClient(account.access_token);

    const fbAdset = await fbClient.createAdSet(account.fb_account_id, {
      name,
      campaign_id: campaign.fb_campaign_id!,
      daily_budget: Math.round(daily_budget * 100),
      targeting: buildTargetingForFB(targeting),
      status: "PAUSED",
    });

    const { data: adSet, error } = await supabase
      .from("ad_sets")
      .insert({
        campaign_id,
        fb_adset_id: fbAdset.id,
        name,
        status: "draft",
        daily_budget,
        targeting,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating ad set:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: adSet }, { status: 201 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
