"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getRepository } from "@/lib/data";
import { requireAdmin } from "@/lib/auth";
import type { DayOfWeek } from "@/lib/types";

export async function createLeagueNightAction(formData: FormData) {
  await requireAdmin();
  const repo = await getRepository();
  const activeSeason = await repo.getActiveSeason();

  const date = String(formData.get("date"));
  const courseName = String(formData.get("courseName") ?? "").trim();
  const coursePar = Number(formData.get("coursePar") ?? 72);
  const capacity = Number(formData.get("capacity") ?? 20);
  const signupFeeDollars = Number(formData.get("signupFee") ?? 0);

  if (!date || !courseName) return;

  const dayIndex = new Date(`${date}T12:00:00`).getDay();
  const dayOfWeek: DayOfWeek = dayIndex === 4 ? "thursday" : "tuesday";

  const night = await repo.createLeagueNight({
    seasonId: activeSeason?.id ?? null,
    date,
    dayOfWeek,
    courseName,
    coursePar: Number.isFinite(coursePar) ? coursePar : 72,
    capacity: Number.isFinite(capacity) ? capacity : 20,
    signupFeeCents: Math.round((Number.isFinite(signupFeeDollars) ? signupFeeDollars : 0) * 100),
  });

  revalidatePath("/admin/leagues");
  redirect(`/admin/leagues/${night.id}`);
}
