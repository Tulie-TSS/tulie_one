import { createClient } from "@/lib/supabase-server";
import { UserRole } from "@/types/database.types";

export async function getUserProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile;
}

export async function hasRole(allowedRoles: UserRole[]) {
  const profile = await getUserProfile();
  if (!profile) return false;
  return allowedRoles.includes(profile.role_type as UserRole);
}

export async function requireAuth() {
  const profile = await getUserProfile();
  if (!profile) {
    throw new Error("Unauthorized");
  }
  return profile;
}

export const ROLE_PERMISSIONS = {
  ADMIN_ONLY: ['admin'] as UserRole[],
  MANAGER_UP: ['admin', 'manager'] as UserRole[],
  MAKER_UP: ['admin', 'manager', 'maker'] as UserRole[],
  ALL: ['admin', 'manager', 'maker', 'observer'] as UserRole[],
};
