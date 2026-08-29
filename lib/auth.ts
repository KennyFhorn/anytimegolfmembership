import { isDemoMode } from "./data";
import { createClient as createSupabaseServerClient } from "./supabase/server";
import { getDemoRole } from "./demo-role";
import { hasCoachAccess } from "./types";
import type { Profile } from "./types";

export { hasCoachAccess };

/** Current signed-in profile, or a fixed demo identity when Supabase isn't
 * configured (its role is mutable in-memory — see lib/demo-role.ts — so the
 * role-management UI is actually testable in demo mode). */
export async function getCurrentProfile(): Promise<Profile | null> {
  if (isDemoMode()) {
    return { id: "demo-admin-profile", role: getDemoRole(), fullName: "Coach Ryan (demo)" };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (!data) return null;

  return { id: data.id, role: data.role, fullName: data.full_name };
}

/** Requires admin OR owner — both get full Coach console access. */
export async function requireAdmin(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile || !hasCoachAccess(profile.role)) {
    throw new Error("Admin access required");
  }
  return profile;
}
