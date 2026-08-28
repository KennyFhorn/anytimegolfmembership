"use server";

import { revalidatePath } from "next/cache";
import { getRepository } from "@/lib/data";
import { requireAdmin } from "@/lib/auth";

export async function createMemberAction(formData: FormData) {
  await requireAdmin();
  const repo = await getRepository();

  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const handicapIndex = Number(formData.get("handicapIndex") ?? 18);

  if (!fullName || !email) return;

  await repo.createMember({
    fullName,
    email,
    phone: phone || null,
    handicapIndex: Number.isFinite(handicapIndex) ? handicapIndex : 18,
  });

  revalidatePath("/admin/members");
}

export async function toggleMemberActiveAction(memberId: string, active: boolean) {
  await requireAdmin();
  const repo = await getRepository();
  await repo.updateMember(memberId, { active });
  revalidatePath("/admin/members");
}

export async function updateHandicapAction(formData: FormData) {
  await requireAdmin();
  const repo = await getRepository();
  const memberId = String(formData.get("memberId"));
  const handicapIndex = Number(formData.get("handicapIndex"));
  if (!memberId || !Number.isFinite(handicapIndex)) return;
  await repo.updateMember(memberId, { handicapIndex });
  revalidatePath("/admin/members");
}
