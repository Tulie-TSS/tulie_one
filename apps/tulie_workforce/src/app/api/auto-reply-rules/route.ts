import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const ruleSchema = z.object({
  name: z.string().min(1),
  trigger_type: z.enum([
    "keyword",
    "intent",
    "first_message",
    "no_response",
    "time_based",
  ]),
  trigger_config: z.object({
    keywords: z.array(z.string()).optional(),
    intent: z.string().optional(),
    time_delay_minutes: z.number().optional(),
    no_response_hours: z.number().optional(),
  }),
  actions: z.array(
    z.object({
      type: z.enum(["reply", "tag", "assign", "escalate", "auto_resolve"]),
      value: z.unknown(),
    }),
  ),
  is_active: z.boolean().optional(),
  priority: z.number().int().min(0).max(100).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const isActive = searchParams.get("is_active");

    let query = supabase
      .from("auto_reply_rules")
      .select("*")
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false });

    if (isActive === "true") {
      query = query.eq("is_active", true);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching auto reply rules:", error);
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
    const validated = ruleSchema.parse(body);

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
      .from("auto_reply_rules")
      .insert({
        ...validated,
        organization_id: profile.organization_id,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating auto reply rule:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
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
