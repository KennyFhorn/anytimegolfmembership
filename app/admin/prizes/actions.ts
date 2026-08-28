"use server";

import { revalidatePath } from "next/cache";
import { getRepository } from "@/lib/data";
import { requireAdmin } from "@/lib/auth";

export async function createPrizeAction(formData: FormData) {
  await requireAdmin();
  const repo = await getRepository();

  const scope = String(formData.get("scope"));
  const leagueNightId = scope === "night" ? String(formData.get("leagueNightId") || "") || null : null;
  const seasonId = scope === "season" ? String(formData.get("seasonId") || "") || null : null;
  const title = String(formData.get("title") ?? "").trim();
  const placeRaw = formData.get("place");
  const place = placeRaw ? Number(placeRaw) : null;
  const winnerMemberId = String(formData.get("winnerMemberId") || "") || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!title || (!leagueNightId && !seasonId)) return;

  await repo.createPrize({ leagueNightId, seasonId, title, place, winnerMemberId, notes });
  revalidatePath("/admin/prizes");
}
