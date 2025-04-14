// GET /api/n8n/templates — Get content templates for n8n to use
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
    const authHeader = request.headers.get("Authorization");
    const apiKey = process.env.N8N_WEBHOOK_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!authHeader || authHeader !== `Bearer ${apiKey}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get("category");

        const wf = createAdminClient();
        let query = wf
            .from("content_templates")
            .select("*")
            .eq("is_active", true)
            .order("name");

        if (category) {
            query = query.eq("category", category);
        }

        const { data, error } = await query;
        if (error) throw error;

        return NextResponse.json({ templates: data });
    } catch (error) {
        console.error("[n8n/templates]", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
