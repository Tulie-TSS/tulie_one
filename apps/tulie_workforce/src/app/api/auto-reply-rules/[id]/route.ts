import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const ruleUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  trigger_type: z
    .enum(["keyword", "intent", "first_message", "no_response", "time_based"])
    .optional(),
  trigger_config: z
    .object({
      keywords: z.array(z.string()).optional(),
      intent: z.string().optional(),
      time_delay_minutes: z.number().optional(),
      no_response_hours: z.number().optional(),
    })
    .optional(),
  actions: z
    .array(
      z.object({
        type: z.enum(["reply", "tag", "assign", "escalate", "auto_resolve"]),
        value: z.unknown(),
      }),
    )
    .optional(),
  is_active: z.boolean().optional(),
  priority: z.number().int().min(0).max(100).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("auto_reply_rules")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching rule:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Rule not found" }, { status: 404 });
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const body = await request.json();
    const validated = ruleUpdateSchema.parse(body);

    const { data, error } = await supabase
      .from("auto_reply_rules")
      .update({
        ...validated,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating rule:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { error } = await supabase
      .from("auto_reply_rules")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting rule:", error);
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
