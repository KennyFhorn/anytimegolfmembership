import type { LeagueNight } from "./types";
import { gameTypeLabel } from "./game-types";

/**
 * League nights don't carry a start time or timezone in the schema yet —
 * every night is treated as a fixed 2-hour block starting 18:00 UTC. This is
 * a placeholder good enough to drive "add to calendar" links; once the data
 * model gains a real start time + timezone, read from that instead.
 */
const START_HOUR_UTC = 18;
const DURATION_HOURS = 2;

export function nightEventWindow(night: Pick<LeagueNight, "date">): { start: Date; end: Date } {
  const start = new Date(`${night.date}T00:00:00Z`);
  start.setUTCHours(START_HOUR_UTC, 0, 0, 0);
  const end = new Date(start);
  end.setUTCHours(start.getUTCHours() + DURATION_HOURS);
  return { start, end };
}

function toIcsUtc(d: Date): string {
  return `${d.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`;
}

function escapeIcs(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

function eventFields(night: LeagueNight) {
  return {
    title: `Anytime Golf Member Night — ${night.courseName}`,
    description: `Anytime Golf Member Night at ${night.courseName}. Format: ${gameTypeLabel(night.gameType)}.`,
    location: night.courseName,
  };
}

/** Full .ics file contents for a single league night (RFC 5545). */
export function buildIcsEvent(night: LeagueNight): string {
  const { start, end } = nightEventWindow(night);
  const { title, description, location } = eventFields(night);
  const uid = `league-night-${night.id}@anytimegolf`;
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Anytime Golf//Member Night//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${toIcsUtc(new Date())}`,
    `DTSTART:${toIcsUtc(start)}`,
    `DTEND:${toIcsUtc(end)}`,
    `SUMMARY:${escapeIcs(title)}`,
    `DESCRIPTION:${escapeIcs(description)}`,
    `LOCATION:${escapeIcs(location)}`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}

/** "Add to Google Calendar" quick-add link — opens in a new tab. */
export function googleCalendarUrl(night: LeagueNight): string {
  const { start, end } = nightEventWindow(night);
  const { title, description, location } = eventFields(night);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${toIcsUtc(start)}/${toIcsUtc(end)}`,
    details: description,
    location,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** "Add to Outlook.com Calendar" deep link — opens in a new tab. */
export function outlookCalendarUrl(night: LeagueNight): string {
  const { start, end } = nightEventWindow(night);
  const { title, description, location } = eventFields(night);
  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: title,
    startdt: start.toISOString(),
    enddt: end.toISOString(),
    body: description,
    location,
  });
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}
