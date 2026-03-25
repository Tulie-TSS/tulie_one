// ============================================
// Memories API Route — CRUD
// GET:  List/search memories
// POST: Add a new memory
// DELETE: Remove a memory
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { memoryManager } from "@/lib/memory";
import type { MemoryType, MemorySource, MemoryAccessLevel } from "@/lib/memory";

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const agentId = searchParams.get("agentId");
        const type = searchParams.get("type") as MemoryType | null;
        const limit = parseInt(searchParams.get("limit") ?? "50", 10);
        const query = searchParams.get("q");

        // If there's a search query, use semantic search
        if (query) {
            const results = await memoryManager.retrieveContext(
                query,
                user.id,
                {
                    agentId: agentId || undefined,
                    matchCount: limit,
                    filterTypes: type ? [type] : undefined,
                }
            );
            return NextResponse.json({ memories: results.memories });
        }

        // Otherwise, list memories with standard filters
        let dbQuery = supabase
            .from("memories")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(limit);

        if (agentId) dbQuery = dbQuery.eq("agent_id", agentId);
        if (type) dbQuery = dbQuery.eq("type", type);

        const { data, error } = await dbQuery;

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ memories: data });
    } catch (error) {
        console.error("[Memories API] GET error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const {
            content,
            type,
            agentId,
            organizationId,
            importance,
            accessLevel,
            source,
            sourceRef,
            metadata,
        }: {
            content: string;
            type: MemoryType;
            agentId?: string;
            organizationId?: string;
            importance?: number;
            accessLevel?: MemoryAccessLevel;
            source?: MemorySource;
            sourceRef?: string;
            metadata?: Record<string, unknown>;
        } = body;

        if (!content || !type) {
            return NextResponse.json(
                { error: "content and type are required" },
                { status: 400 }
            );
        }

        const id = await memoryManager.addMemory({
            content,
            type,
            userId: user.id,
            agentId,
            organizationId,
            importance,
            accessLevel,
            source,
            sourceRef,
            metadata,
        });

        return NextResponse.json({ id }, { status: 201 });
    } catch (error) {
        console.error("[Memories API] POST error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const memoryId = searchParams.get("id");

        if (!memoryId) {
            return NextResponse.json({ error: "id is required" }, { status: 400 });
        }

        const { error } = await supabase
            .from("memories")
            .delete()
            .eq("id", memoryId)
            .eq("user_id", user.id);  // RLS ensures user can only delete own

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ deleted: true });
    } catch (error) {
        console.error("[Memories API] DELETE error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
