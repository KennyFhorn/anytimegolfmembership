import { NextResponse } from "next/server";
import { getRepository } from "@/lib/data";
import { buildIcsEvent } from "@/lib/ics";

export const dynamic = "force-dynamic";

/**
 * Serves a single league night as a downloadable .ics file — the universal
 * fallback for Apple Calendar (and anything else without a quick-add web
 * link) alongside the Google/Outlook links on the Calendar page.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const repo = await getRepository();
  const night = await repo.getLeagueNight(id);
  if (!night) {
    return NextResponse.json({ error: "League night not found" }, { status: 404 });
  }

  const ics = buildIcsEvent(night);
  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="anytime-golf-${night.date}.ics"`,
    },
  });
}
