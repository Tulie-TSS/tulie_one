import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const settingsSchema = z.object({
  auto_execution_enabled: z.boolean().optional(),
  max_budget_increase_percent: z.number().min(1).max(100).optional(),
  max_budget_decrease_percent: z.number().min(1).max(100).optional(),
  cpr_threshold_multiplier: z.number().min(0.5).max(5).optional(),
  daily_analysis_enabled: z.boolean().optional(),
  notification_email: z.string().email().optional().nullable(),
});

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", userData.user.id)
      .single();

    if (!profile?.organization_id) {
      return NextResponse.json(
        { error: "User has no organization" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("ai_settings")
      .select("*")
      .eq("organization_id", profile.organization_id)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching AI settings:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      const { data: newSettings, error: createError } = await supabase
        .from("ai_settings")
        .insert({
          organization_id: profile.organization_id,
          auto_execution_enabled: false,
          max_budget_increase_percent: 20,
          max_budget_decrease_percent: 50,
          cpr_threshold_multiplier: 1.5,
          daily_analysis_enabled: true,
        })
        .select()
        .single();

      if (createError) {
        console.error("Error creating AI settings:", createError);
        return NextResponse.json(
          { error: createError.message },
          { status: 500 },
        );
      }

      return NextResponse.json({ data: newSettings });
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

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", userData.user.id)
      .single();

    if (!profile?.organization_id) {
      return NextResponse.json(
        { error: "User has no organization" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const validated = settingsSchema.parse(body);

    const { data: existing } = await supabase
      .from("ai_settings")
      .select("id")
      .eq("organization_id", profile.organization_id)
      .single();

    let result;
    if (existing) {
      const { data, error } = await supabase
        .from("ai_settings")
        .update({
          ...validated,
          updated_at: new Date().toISOString(),
        })
        .eq("organization_id", profile.organization_id)
        .select()
        .single();

      if (error) {
        console.error("Error updating AI settings:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      result = data;
    } else {
      const { data, error } = await supabase
        .from("ai_settings")
        .insert({
          organization_id: profile.organization_id,
          ...validated,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating AI settings:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      result = data;
    }

    return NextResponse.json({ data: result });
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
