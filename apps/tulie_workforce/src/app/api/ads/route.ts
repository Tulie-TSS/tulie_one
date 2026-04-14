import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getFBClient } from "@/lib/fb/client";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const adsetId = searchParams.get("adset_id");

    let query = supabase
      .from("ads")
      .select("*")
      .order("created_at", { ascending: false });

    if (adsetId) {
      query = query.eq("adset_id", adsetId);
    }

    const { data: ads, error } = await query;

    if (error) {
      console.error("Error fetching ads:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: ads });
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

    const { adset_id, name, creative_type, creative_data } = body;

    const { data: adSet } = await supabase
      .from("ad_sets")
      .select(
        `
                id,
                fb_adset_id,
                campaigns(
                    fb_campaign_id,
                    fb_ad_accounts(fb_account_id, access_token)
                )
            `,
      )
      .eq("id", adset_id)
      .single();

    if (!adSet) {
      return NextResponse.json({ error: "Ad set not found" }, { status: 404 });
    }

    const account = adSet.campaigns.fb_ad_accounts as {
      fb_account_id: string;
      access_token: string;
    };
    const fbClient = getFBClient(account.access_token);

    const fbAd = await fbClient.createAd(account.fb_account_id, {
      name,
      adset_id: adSet.fb_adset_id!,
      creative: {
        body: creative_data.body,
        title: creative_data.title,
        image_url: creative_data.image_url,
        call_to_action: creative_data.call_to_action,
      },
      status: "PAUSED",
    });

    const { data: ad, error } = await supabase
      .from("ads")
      .insert({
        adset_id,
        fb_ad_id: fbAd.id,
        name,
        status: "draft",
        creative_type,
        creative_data,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating ad:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: ad }, { status: 201 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
