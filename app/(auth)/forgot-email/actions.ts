"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type RecoverEmailResult =
  | { ok: true; email: string }
  | { ok: false; message: string };

const GENERIC_FAIL =
  "We couldn't match those details to an account. Double-check them, or ask Coach Ryan for help.";

const digits = (s: string) => s.replace(/\D+/g, "");
const normText = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const lastNameOf = (fullName: string) => {
  const parts = normText(fullName).split(" ").filter(Boolean);
  return parts.length ? parts[parts.length - 1] : "";
};

/**
 * "Forgot which email you used." Verifies identity with last name plus at
 * least one of phone / address, then returns ONLY the email of the single
 * matching member. Any ambiguity or partial match returns the same generic
 * failure so the form can't be used to probe the roster.
 */
export async function recoverEmail(
  _prev: RecoverEmailResult | null,
  formData: FormData,
): Promise<RecoverEmailResult> {
  const lastName = normText(String(formData.get("lastName") ?? ""));
  const phoneRaw = String(formData.get("phone") ?? "").trim();
  const addressRaw = String(formData.get("address") ?? "").trim();

  if (!lastName || (!phoneRaw && !addressRaw)) {
    return {
      ok: false,
      message: "Enter your last name and at least one of phone or address.",
    };
  }

  if (!isSupabaseConfigured) {
    return { ok: false, message: GENERIC_FAIL };
  }

  // Small constant delay to blunt automated probing.
  await new Promise((r) => setTimeout(r, 600));

  let data: { full_name: string | null; email: string; phone: string | null; address: string | null }[] | null =
    null;
  try {
    const admin = createAdminClient();
    const res = await admin.from("members").select("full_name, email, phone, address");
    if (res.error) return { ok: false, message: GENERIC_FAIL };
    data = res.data;
  } catch {
    return { ok: false, message: GENERIC_FAIL };
  }
  if (!data) {
    return { ok: false, message: GENERIC_FAIL };
  }

  const phoneQ = digits(phoneRaw);
  const addressQ = normText(addressRaw);

  const matches = data.filter((m) => {
    if (lastNameOf(m.full_name ?? "") !== lastName) return false;
    const phoneOk = phoneQ.length >= 7 && digits(m.phone ?? "") === phoneQ;
    const addressOk = addressQ.length >= 5 && normText(m.address ?? "") === addressQ;
    return phoneOk || addressOk;
  });

  if (matches.length !== 1) {
    return { ok: false, message: GENERIC_FAIL };
  }

  return { ok: true, email: matches[0].email };
}
