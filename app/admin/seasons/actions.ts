"use server";

import { revalidatePath } from "next/cache";
import { getRepository } from "@/lib/data";
import { requireAdmin } from "@/lib/auth";

export async function createSeasonAction(formData: FormData) {
  await requireAdmin();
  const repo = await getRepository();
  const name = String(formData.get("name") ?? "").trim();
  const startDate = String(formData.get("startDate") ?? "");
  if (!name || !startDate) return;
  await repo.createSeason(name, startDate);
  revalidatePath("/admin/seasons");
}

export async function setActiveSeasonAction(seasonId: string) {
  await requireAdmin();
  const repo = await getRepository();
  await repo.setActiveSeason(seasonId);
  revalidatePath("/admin/seasons");
  revalidatePath("/standings");
}
