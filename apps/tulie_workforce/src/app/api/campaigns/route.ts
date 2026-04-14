import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getFBClient, campaignObjectiveToFB } from "@/lib/fb/client";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const accountId = searchParams.get("account_id");

    let query = supabase
      .from("campaigns")
      .select(
        `
                *,
                ad_sets (
                    *,
                    ads (*)
                )
            `,
      )
      .order("created_at", { ascending: false });

    if (accountId) {
      query = query.eq("fb_ad_account_id", accountId);
    }

    const { data: campaigns, error } = await query;

    if (error) {
      console.error("Error fetching campaigns:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: campaigns });
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

    const {
      fb_ad_account_id,
      name,
      objective,
      daily_budget,
      lifetime_budget,
      cpr_target,
      start_date,
      end_date,
      tags,
    } = body;

    const { data: account } = await supabase
      .from("fb_ad_accounts")
      .select("fb_account_id, access_token")
      .eq("id", fb_ad_account_id)
      .single();

    if (!account) {
      return NextResponse.json(
        { error: "Ad account not found" },
        { status: 404 },
      );
    }

    const fbClient = getFBClient(account.access_token);

    const fbCampaign = await fbClient.createCampaign(account.fb_account_id, {
      name,
      objective: campaignObjectiveToFB(objective),
      status: "PAUSED",
      daily_budget: Math.round(daily_budget * 100),
    });

    const { data: campaign, error } = await supabase
      .from("campaigns")
      .insert({
        fb_ad_account_id,
        fb_campaign_id: fbCampaign.id,
        name,
        objective,
        status: "draft",
        daily_budget,
        lifetime_budget,
        cpr_target,
        start_date,
        end_date,
        tags: tags || [],
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating campaign:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: campaign }, { status: 201 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
