"use server";

import { revalidatePath } from "next/cache";
import { getRepository } from "@/lib/data";
import { requireAdmin } from "@/lib/auth";
import type { DayOfWeek } from "@/lib/types";
import { DEFAULT_GAME_TYPE, GAME_TYPES } from "@/lib/game-types";

/**
 * Same creation logic as admin/leagues' createLeagueNightAction, but scoped
 * to the Calendar page: it revalidates and stays on /calendar afterward
 * instead of redirecting into the admin console, since /calendar is meant
 * to be usable as the source of record for scheduling, not just viewing.
 */
export async function createLeagueNightFromCalendarAction(formData: FormData) {
  await requireAdmin();
  const repo = await getRepository();
  const activeSeason = await repo.getActiveSeason();

  const date = String(formData.get("date"));
  const courseName = String(formData.get("courseName") ?? "").trim();
  const coursePar = Number(formData.get("coursePar") ?? 72);
  const capacity = Number(formData.get("capacity") ?? 20);
  const signupFeeDollars = Number(formData.get("signupFee") ?? 0);
  const gameTypeRaw = String(formData.get("gameType") ?? "");
  const gameType = GAME_TYPES.some((g) => g.value === gameTypeRaw) ? gameTypeRaw : DEFAULT_GAME_TYPE;

  if (!date || !courseName) return;

  const dayIndex = new Date(`${date}T12:00:00`).getDay();
  const dayOfWeek: DayOfWeek = dayIndex === 4 ? "thursday" : "tuesday";

  await repo.createLeagueNight({
    seasonId: activeSeason?.id ?? null,
    date,
    dayOfWeek,
    courseName,
    coursePar: Number.isFinite(coursePar) ? coursePar : 72,
    capacity: Number.isFinite(capacity) ? capacity : 20,
    signupFeeCents: Math.round((Number.isFinite(signupFeeDollars) ? signupFeeDollars : 0) * 100),
    gameType,
  });

  revalidatePath("/calendar");
  revalidatePath("/admin/leagues");
  revalidatePath("/dashboard");
}
