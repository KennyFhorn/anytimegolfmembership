"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getRepository } from "@/lib/data";
import { requireAdmin } from "@/lib/auth";
import type { UserRole } from "@/lib/types";

const ASSIGNABLE_ROLES: UserRole[] = ["member", "admin", "owner"];

export async function createMemberAction(formData: FormData) {
  await requireAdmin();
  const repo = await getRepository();

  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const fullName = `${firstName} ${lastName}`.trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const handicapIndex = Number(formData.get("handicapIndex") ?? 18);
  const birthdate = String(formData.get("birthdate") ?? "").trim();
  const gender = String(formData.get("gender") ?? "").trim();
  const yearStartedGolf = Number(formData.get("yearStartedGolf") ?? NaN);
  const emergencyContactName = String(formData.get("emergencyContactName") ?? "").trim();
  const emergencyContactPhone = String(formData.get("emergencyContactPhone") ?? "").trim();

  if (!fullName || !email) return;

  await repo.createMember({
    fullName,
    firstName: firstName || null,
    lastName: lastName || null,
    email,
    phone: phone || null,
    address: address || null,
    handicapIndex: Number.isFinite(handicapIndex) ? handicapIndex : 18,
    birthdate: birthdate || null,
    gender: gender || null,
    yearStartedGolf: Number.isFinite(yearStartedGolf) ? yearStartedGolf : null,
    emergencyContactName: emergencyContactName || null,
    emergencyContactPhone: emergencyContactPhone || null,
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

export async function updateMemberAction(memberId: string, formData: FormData) {
  await requireAdmin();
  const repo = await getRepository();

  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const handicapIndex = Number(formData.get("handicapIndex"));
  const birthdate = String(formData.get("birthdate") ?? "").trim();
  const gender = String(formData.get("gender") ?? "").trim();
  const yearStartedGolf = Number(formData.get("yearStartedGolf") ?? NaN);
  const emergencyContactName = String(formData.get("emergencyContactName") ?? "").trim();
  const emergencyContactPhone = String(formData.get("emergencyContactPhone") ?? "").trim();
  const active = String(formData.get("active") ?? "true") === "true";

  if (!memberId || !firstName || !lastName || !email) return;

  await repo.updateMember(memberId, {
    fullName: `${firstName} ${lastName}`.trim(),
    firstName,
    lastName,
    email,
    phone: phone || null,
    address: address || null,
    handicapIndex: Number.isFinite(handicapIndex) ? handicapIndex : undefined,
    birthdate: birthdate || null,
    gender: gender || null,
    yearStartedGolf: Number.isFinite(yearStartedGolf) ? yearStartedGolf : null,
    emergencyContactName: emergencyContactName || null,
    emergencyContactPhone: emergencyContactPhone || null,
    active,
  });

  revalidatePath("/admin/members");
  redirect("/admin/members");
}

export async function updateMemberRoleAction(memberId: string, formData: FormData) {
  // requireAdmin() covers both admin and owner — both are allowed to use
  // the role radio buttons, per how it was asked for.
  await requireAdmin();
  const repo = await getRepository();

  const role = String(formData.get("role") ?? "");
  if (!ASSIGNABLE_ROLES.includes(role as UserRole)) return;

  await repo.updateMemberRole(memberId, role as UserRole);
  revalidatePath(`/admin/members/${memberId}`);
  revalidatePath("/admin/members");
}
