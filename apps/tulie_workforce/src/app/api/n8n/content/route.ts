// POST /api/n8n/content — n8n creates content draft
// GET  /api/n8n/content — Get posts by status
// PATCH /api/n8n/content — Update post (approve, publish, etc)

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

function validateAuth(request: NextRequest): boolean {
    const authHeader = request.headers.get("Authorization");
    const apiKey = process.env.N8N_WEBHOOK_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!authHeader || !apiKey) return false;
    return authHeader === `Bearer ${apiKey}`;
}

// GET — List content posts
export async function GET(request: NextRequest) {
    if (!validateAuth(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // draft, pending, approved, published
    const limit = parseInt(searchParams.get("limit") || "20");

    try {
        const wf = createAdminClient();
        let query = wf
            .from("content_posts")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(limit);

        if (status) {
            query = query.eq("status", status);
        }

        const { data, error } = await query;
        if (error) throw error;

        return NextResponse.json({ posts: data, count: data?.length || 0 });
    } catch (error) {
        console.error("[n8n/content GET]", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}

// POST — Create new content post (called by n8n Content Creator workflow)
export async function POST(request: NextRequest) {
    if (!validateAuth(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const wf = createAdminClient();

        const { data, error } = await wf
            .from("content_posts")
            .insert({
                title: body.title,
                body: body.body,
                hashtags: body.hashtags || [],
                tone: body.tone || "professional",
                category: body.category || "general",
                image_prompt: body.image_prompt || null,
                status: body.status || "draft",
                auto_boost: body.auto_boost || false,
                boost_budget: body.boost_budget || 0,
                fb_page_id: body.fb_page_id || null,
                scheduled_at: body.scheduled_at || null,
                metadata: body.metadata || {},
                created_by: body.created_by || null,
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, post: data });
    } catch (error) {
        console.error("[n8n/content POST]", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}

// PATCH — Update content post (approve, add image, publish, etc)
export async function PATCH(request: NextRequest) {
    if (!validateAuth(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json({ error: "id is required" }, { status: 400 });
        }

        const wf = createAdminClient();
        
        // Build update object (only include provided fields)
        const updateData: Record<string, unknown> = {};
        const allowedFields = [
            "title", "body", "hashtags", "image_url", "image_prompt",
            "status", "rejection_reason", "fb_post_id", "fb_page_id",
            "scheduled_at", "published_at", "auto_boost", "boost_budget",
            "campaign_id", "likes", "comments", "shares", "reach",
            "approved_by", "metadata",
        ];

        for (const field of allowedFields) {
            if (updates[field] !== undefined) {
                updateData[field] = updates[field];
            }
        }

        const { data, error } = await wf
            .from("content_posts")
            .update(updateData)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, post: data });
    } catch (error) {
        console.error("[n8n/content PATCH]", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
