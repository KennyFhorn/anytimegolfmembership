"use server";

import { redirect } from "next/navigation";
import { getRepository } from "@/lib/data";
import { getCurrentProfile } from "@/lib/auth";

export async function registerForNight(formData: FormData) {
  const leagueNightId = String(formData.get("leagueNightId"));
  const repo = await getRepository();
  const profile = await getCurrentProfile();
  const me = profile ? await repo.getMemberByProfileId(profile.id) : null;

  if (!me) {
    redirect(`/leagues/${leagueNightId}?error=no-member-profile`);
  }

  await repo.registerMember(leagueNightId, me.id);
  redirect(`/api/stripe/checkout?leagueNightId=${leagueNightId}`);
}
