import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const recommendationSchema = z.object({
  campaign_id: z.string().uuid(),
  type: z.enum([
    "increase_budget",
    "decrease_budget",
    "pause_campaign",
    "resume_campaign",
    "adjust_audience",
    "optimize_bid",
    "create_new_creative",
    "test_different_copy",
    "lower_cpr_target",
    "raise_cpr_target",
  ]),
  reason: z.string().min(1),
  details: z.record(z.string(), z.unknown()).optional(),
  priority: z.number().int().min(0).max(10).optional(),
  is_auto_exec: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const campaignId = searchParams.get("campaign_id");

    let query = supabase
      .from("recommendations")
      .select(
        `
        *,
        campaign:campaigns(id, name, status, daily_budget, cpr_target)
        `,
      )
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    if (campaignId) {
      query = query.eq("campaign_id", campaignId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching recommendations:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
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

    const validated = recommendationSchema.parse(body);

    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (!profile?.organization_id) {
      return NextResponse.json(
        { error: "User has no organization" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("recommendations")
      .insert({
        ...validated,
        organization_id: profile.organization_id,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating recommendation:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 },
      );
    }
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
