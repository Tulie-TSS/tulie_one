// ============================================
// RBAC — Role-Based Access Control
// getUserRole, permission checks, route guards
// ============================================

import { createClient } from "@supabase/supabase-js";

// ─── Types ───

export type OrgRole = "owner" | "manager" | "specialist" | "viewer";

export interface UserRoleInfo {
    userId: string;
    role: OrgRole;
    organizationId: string | null;
    organizationName: string | null;
}

export interface Permission {
    canManageAgents: boolean;
    canManageTeam: boolean;
    canViewBilling: boolean;
    canConfigureAI: boolean;
    canApprove: boolean;
    canCreateTasks: boolean;
    canViewAllTasks: boolean;
    canViewOrgMemories: boolean;
    canManageKnowledge: boolean;
}

// ─── Permission Matrix ───

const PERMISSION_MATRIX: Record<OrgRole, Permission> = {
    owner: {
        canManageAgents: true,
        canManageTeam: true,
        canViewBilling: true,
        canConfigureAI: true,
        canApprove: true,
        canCreateTasks: true,
        canViewAllTasks: true,
        canViewOrgMemories: true,
        canManageKnowledge: true,
    },
    manager: {
        canManageAgents: false,
        canManageTeam: false,
        canViewBilling: false,
        canConfigureAI: false,
        canApprove: true,
        canCreateTasks: true,
        canViewAllTasks: true,
        canViewOrgMemories: true,
        canManageKnowledge: true,
    },
    specialist: {
        canManageAgents: false,
        canManageTeam: false,
        canViewBilling: false,
        canConfigureAI: false,
        canApprove: false,
        canCreateTasks: true,
        canViewAllTasks: false,
        canViewOrgMemories: false,  // only public + own
        canManageKnowledge: false,
    },
    viewer: {
        canManageAgents: false,
        canManageTeam: false,
        canViewBilling: false,
        canConfigureAI: false,
        canApprove: false,
        canCreateTasks: false,
        canViewAllTasks: false,
        canViewOrgMemories: false,
        canManageKnowledge: false,
    },
};

// ─── Supabase Admin Client ───

function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
        throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    }

    return createClient(url, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
    });
}

// ─── Core Functions ───

/**
 * Fetch a user's role and organization context.
 * Uses the get_user_org_role RPC defined in migration 005.
 */
export async function getUserRole(userId: string): Promise<UserRoleInfo> {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
        .rpc("get_user_org_role", { p_user_id: userId });

    if (error || !data || (Array.isArray(data) && data.length === 0)) {
        // No org membership — treat as owner of personal workspace
        return {
            userId,
            role: "owner",
            organizationId: null,
            organizationName: null,
        };
    }

    const row = Array.isArray(data) ? data[0] : data;

    return {
        userId,
        role: row.role as OrgRole,
        organizationId: row.organization_id,
        organizationName: row.organization_name,
    };
}

/**
 * Get the permission set for a given role.
 */
export function getPermissions(role: OrgRole): Permission {
    return PERMISSION_MATRIX[role];
}

/**
 * Check if a user can access a specific resource/action.
 */
export async function canAccess(
    userId: string,
    permission: keyof Permission
): Promise<boolean> {
    const roleInfo = await getUserRole(userId);
    const perms = getPermissions(roleInfo.role);
    return perms[permission];
}

/**
 * Protected route paths that require owner role.
 */
export const OWNER_ONLY_ROUTES = [
    "/settings/team",
    "/settings/billing",
    "/settings/api",
];

/**
 * Protected route paths that require at least manager role.
 */
export const MANAGER_ROUTES = [
    "/approvals",
];

/**
 * Sidebar items that should be hidden per role.
 */
export function getHiddenSidebarItems(role: OrgRole): string[] {
    const hidden: string[] = [];
    const perms = getPermissions(role);

    if (!perms.canViewBilling) hidden.push("Billing");
    if (!perms.canConfigureAI) hidden.push("AI Models");
    if (!perms.canManageTeam) hidden.push("Team");

    return hidden;
}
