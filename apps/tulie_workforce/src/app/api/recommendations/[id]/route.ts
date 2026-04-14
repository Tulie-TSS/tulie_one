import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("recommendations")
      .select(
        `
        *,
        campaign:campaigns(id, name, status, daily_budget, cpr_target, fb_campaign_id),
        created_by_user:profiles!recommendations_created_by_fkey(id, full_name),
        approved_by_user:profiles!recommendations_approved_by_fkey(id, full_name)
        `,
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching recommendation:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json(
        { error: "Recommendation not found" },
        { status: 404 },
      );
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

const actionSchema = z.object({
  action: z.enum(["approve", "reject", "execute"]),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const body = await request.json();
    const { action } = actionSchema.parse(body);

    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: recommendation, error: fetchError } = await supabase
      .from("recommendations")
      .select("*, campaign:campaigns(*)")
      .eq("id", id)
      .single();

    if (fetchError || !recommendation) {
      return NextResponse.json(
        { error: "Recommendation not found" },
        { status: 404 },
      );
    }

    if (action === "approve") {
      const { error } = await supabase
        .from("recommendations")
        .update({
          status: "approved",
          approved_by: user.user.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) {
        console.error("Error approving recommendation:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ data: { status: "approved" } });
    }

    if (action === "reject") {
      const { error } = await supabase
        .from("recommendations")
        .update({
          status: "rejected",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) {
        console.error("Error rejecting recommendation:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ data: { status: "rejected" } });
    }

    if (action === "execute") {
      const campaign = recommendation.campaign;
      if (!campaign?.fb_campaign_id) {
        return NextResponse.json(
          { error: "Campaign not linked to Facebook" },
          { status: 400 },
        );
      }

      let updateData: Record<string, unknown> = {};
      let fbUpdate: Record<string, unknown> = {};

      switch (recommendation.type) {
        case "pause_campaign":
          updateData = { status: "paused" };
          fbUpdate = { status: "PAUSED" };
          break;
        case "resume_campaign":
          updateData = { status: "active" };
          fbUpdate = { status: "ACTIVE" };
          break;
        case "increase_budget":
          if (recommendation.details?.new_budget) {
            const increase = Number(recommendation.details.new_budget);
            updateData = { daily_budget: increase };
            fbUpdate = { daily_budget: Math.round(increase * 100) };
          }
          break;
        case "decrease_budget":
          if (recommendation.details?.new_budget) {
            const decrease = Number(recommendation.details.new_budget);
            updateData = { daily_budget: decrease };
            fbUpdate = { daily_budget: Math.round(decrease * 100) };
          }
          break;
        default:
          return NextResponse.json(
            { error: "Unsupported action type for execution" },
            { status: 400 },
          );
      }

      if (Object.keys(updateData).length > 0) {
        await supabase
          .from("campaigns")
          .update(updateData)
          .eq("id", recommendation.campaign_id);
      }

      await supabase
        .from("recommendations")
        .update({
          status: "executed",
          executed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      return NextResponse.json({
        data: { status: "executed", fb_update: fbUpdate },
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { error } = await supabase
      .from("recommendations")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting recommendation:", error);
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
