import { NextResponse, type NextRequest } from "next/server";
import { getCurrentProfile } from "@/lib/auth";
import { getRepository, isDemoMode } from "@/lib/data";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * Marking a registration "paid" is a trusted, server-only decision (real
 * Stripe webhook, a free night, or the no-keys-yet dev shortcut below) — it
 * must not depend on the member's own RLS permissions, so it goes through
 * the service-role client once Supabase is configured.
 */
async function markRegistrationPaid(registrationId: string) {
  if (isDemoMode()) {
    const repo = await getRepository();
    await repo.setPaymentStatus(registrationId, "paid");
    return;
  }
  const admin = createAdminClient();
  await admin.from("registrations").update({ payment_status: "paid" }).eq("id", registrationId);
}

/**
 * Starts (or fast-forwards) payment for a league night registration.
 * GET /api/stripe/checkout?leagueNightId=...
 *
 * Without STRIPE_SECRET_KEY configured, this simulates an instant successful
 * payment so the rest of the app (registration → paid → grouped) can be
 * exercised end-to-end before Stripe keys exist.
 */
export async function GET(request: NextRequest) {
  const leagueNightId = request.nextUrl.searchParams.get("leagueNightId");
  if (!leagueNightId) {
    return NextResponse.json({ error: "leagueNightId is required" }, { status: 400 });
  }

  const repo = await getRepository();
  const profile = await getCurrentProfile();
  const me = profile ? await repo.getMemberByProfileId(profile.id) : null;
  if (!me) {
    return NextResponse.redirect(new URL(`/leagues/${leagueNightId}?error=no-member-profile`, request.url));
  }

  const night = await repo.getLeagueNight(leagueNightId);
  if (!night) {
    return NextResponse.json({ error: "League night not found" }, { status: 404 });
  }

  const registration = await repo.registerMember(leagueNightId, me.id);

  if (registration.paymentStatus === "paid" || night.signupFeeCents === 0) {
    await markRegistrationPaid(registration.id);
    return NextResponse.redirect(new URL(`/leagues/${leagueNightId}?paid=1`, request.url));
  }

  if (!isStripeConfigured) {
    // Demo/dev fallback: no Stripe keys yet, simulate a successful payment.
    await markRegistrationPaid(registration.id);
    return NextResponse.redirect(new URL(`/leagues/${leagueNightId}?paid=1&simulated=1`, request.url));
  }

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: night.signupFeeCents,
          product_data: {
            name: `Anytime Golf League Night — ${night.courseName}`,
            description: `${night.date} signup fee`,
          },
        },
        quantity: 1,
      },
    ],
    customer_email: me.email,
    metadata: { registrationId: registration.id, leagueNightId },
    success_url: new URL(`/leagues/${leagueNightId}?paid=1`, request.url).toString(),
    cancel_url: new URL(`/leagues/${leagueNightId}?cancelled=1`, request.url).toString(),
  });

  if (!session.url) {
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
  return NextResponse.redirect(session.url);
}
