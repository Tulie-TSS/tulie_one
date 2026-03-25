// ============================================
// Organizations API — Org + Member Management
// GET:    Get current org and members
// POST:   Create org or invite member
// PATCH:  Update member role
// DELETE: Remove member
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/roles";

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch user's org membership
        const { data: membership } = await supabase
            .from("organization_members")
            .select(`
                role,
                organization:organizations(id, name, plan, settings, created_at)
            `)
            .eq("user_id", user.id)
            .single();

        if (!membership?.organization) {
            return NextResponse.json({ organization: null, members: [] });
        }

        const org = Array.isArray(membership.organization)
            ? membership.organization[0]
            : membership.organization;

        // Fetch all members (visible to all org members via RLS)
        const { data: members } = await supabase
            .from("organization_members")
            .select(`
                id,
                role,
                joined_at,
                user:profiles(id, email, full_name, avatar_url)
            `)
            .eq("organization_id", org.id)
            .order("joined_at", { ascending: true });

        return NextResponse.json({
            organization: org,
            currentRole: membership.role,
            members: members ?? [],
        });
    } catch (error) {
        console.error("[Org API] GET error:", error);
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
        const { action } = body;

        if (action === "create_org") {
            const { name, plan } = body;

            if (!name) {
                return NextResponse.json({ error: "name is required" }, { status: 400 });
            }

            // Create org
            const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

            const { data: org, error: orgError } = await supabase
                .from("organizations")
                .insert({ name, slug, plan: plan ?? "free" })
                .select("id")
                .single();

            if (orgError) {
                return NextResponse.json({ error: orgError.message }, { status: 500 });
            }

            // Add creator as owner
            await supabase.from("organization_members").insert({
                organization_id: org.id,
                user_id: user.id,
                role: "owner",
                invited_by: user.id,
            });

            // Update profile with org
            await supabase
                .from("profiles")
                .update({ organization_id: org.id })
                .eq("id", user.id);

            return NextResponse.json({ organizationId: org.id }, { status: 201 });
        }

        if (action === "invite_member") {
            const { email, role, organizationId } = body;

            if (!email || !role || !organizationId) {
                return NextResponse.json(
                    { error: "email, role, and organizationId are required" },
                    { status: 400 }
                );
            }

            // Verify caller is owner
            const roleInfo = await getUserRole(user.id);
            if (roleInfo.role !== "owner") {
                return NextResponse.json({ error: "Only owners can invite members" }, { status: 403 });
            }

            // Look up the user by email
            const { data: profile } = await supabase
                .from("profiles")
                .select("id")
                .eq("email", email)
                .single();

            if (!profile) {
                return NextResponse.json(
                    { error: "User not found. They must sign up first." },
                    { status: 404 }
                );
            }

            // Add member
            const { error: memberError } = await supabase
                .from("organization_members")
                .insert({
                    organization_id: organizationId,
                    user_id: profile.id,
                    role,
                    invited_by: user.id,
                });

            if (memberError) {
                return NextResponse.json({ error: memberError.message }, { status: 500 });
            }

            // Update their profile
            await supabase
                .from("profiles")
                .update({ organization_id: organizationId })
                .eq("id", profile.id);

            return NextResponse.json({ invited: true }, { status: 201 });
        }

        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    } catch (error) {
        console.error("[Org API] POST error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { memberId, role } = body;

        // Verify caller is owner
        const roleInfo = await getUserRole(user.id);
        if (roleInfo.role !== "owner") {
            return NextResponse.json({ error: "Only owners can change roles" }, { status: 403 });
        }

        const { error } = await supabase
            .from("organization_members")
            .update({ role })
            .eq("id", memberId);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ updated: true });
    } catch (error) {
        console.error("[Org API] PATCH error:", error);
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
        const memberId = searchParams.get("memberId");

        if (!memberId) {
            return NextResponse.json({ error: "memberId is required" }, { status: 400 });
        }

        // Verify caller is owner
        const roleInfo = await getUserRole(user.id);
        if (roleInfo.role !== "owner") {
            return NextResponse.json({ error: "Only owners can remove members" }, { status: 403 });
        }

        const { error } = await supabase
            .from("organization_members")
            .delete()
            .eq("id", memberId);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ removed: true });
    } catch (error) {
        console.error("[Org API] DELETE error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
