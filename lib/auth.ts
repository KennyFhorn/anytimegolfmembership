import { isDemoMode } from "./data";
import { createClient as createSupabaseServerClient } from "./supabase/server";
import type { Profile } from "./types";

const DEMO_PROFILE: Profile = { id: "demo-admin-profile", role: "admin", fullName: "Coach Ryan (demo)" };

/** Current signed-in profile, or a fixed demo admin when Supabase isn't configured. */
export async function getCurrentProfile(): Promise<Profile | null> {
  if (isDemoMode()) {
    return DEMO_PROFILE;
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

export async function requireAdmin(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") {
    throw new Error("Admin access required");
  }
  return profile;
}
