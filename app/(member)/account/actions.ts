"use server";

import { revalidatePath } from "next/cache";
import { getRepository } from "@/lib/data";
import { getCurrentProfile } from "@/lib/auth";

export async function updateOwnProfileAction(formData: FormData) {
  const profile = await getCurrentProfile();
  if (!profile) throw new Error("Not signed in");

  const repo = await getRepository();
  const me = await repo.getMemberByProfileId(profile.id);
  if (!me) throw new Error("No member record linked to this account");

  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const birthdate = String(formData.get("birthdate") ?? "").trim();
  const gender = String(formData.get("gender") ?? "").trim();
  const yearStartedGolf = Number(formData.get("yearStartedGolf") ?? NaN);
  const emergencyContactName = String(formData.get("emergencyContactName") ?? "").trim();
  const emergencyContactPhone = String(formData.get("emergencyContactPhone") ?? "").trim();

  if (!firstName || !lastName) return;

  await repo.updateOwnMember(me.id, {
    firstName,
    lastName,
    phone: phone || null,
    address: address || null,
    birthdate: birthdate || null,
    gender: gender || null,
    yearStartedGolf: Number.isFinite(yearStartedGolf) ? yearStartedGolf : null,
    emergencyContactName: emergencyContactName || null,
    emergencyContactPhone: emergencyContactPhone || null,
  });

  revalidatePath("/account");
  revalidatePath("/dashboard");
}
