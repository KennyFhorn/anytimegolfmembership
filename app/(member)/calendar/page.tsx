import Link from "next/link";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { getRepository } from "@/lib/data";
import { cn, formatDate } from "@/lib/utils";
import { googleCalendarUrl, outlookCalendarUrl } from "@/lib/ics";
import type { LeagueNight } from "@/lib/types";

function parseMonthParam(v: string | undefined): Date {
  if (v && /^\d{4}-\d{2}$/.test(v)) {
    const [y, m] = v.split("-").map(Number);
    return new Date(y, m - 1, 1);
  }
  return new Date();
}

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default async function CalendarPage({ searchParams }: PageProps<"/calendar">) {
  const { month: monthParam } = await searchParams;
  const repo = await getRepository();
  const nights = await repo.listLeagueNights();

  const monthAnchor = parseMonthParam(typeof monthParam === "string" ? monthParam : undefined);
  const monthStart = startOfMonth(monthAnchor);
  const gridStart = startOfWeek(monthStart);
  const gridEnd = endOfWeek(endOfMonth(monthStart));
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const nightsByDay = new Map<string, LeagueNight[]>();
  for (const n of nights) {
    nightsByDay.set(n.date, [...(nightsByDay.get(n.date) ?? []), n]);
  }

  const todayKey = format(new Date(), "yyyy-MM-dd");
  const upcoming = [...nights].filter((n) => n.date >= todayKey).sort((a, b) => a.date.localeCompare(b.date));
  const past = [...nights].filter((n) => n.date < todayKey).sort((a, b) => b.date.localeCompare(a.date));

  const prevMonth = format(subMonths(monthStart, 1), "yyyy-MM");
  const nextMonth = format(addMonths(monthStart, 1), "yyyy-MM");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
        <p className="text-muted">Every Tuesday and Thursday night, on the books.</p>
      </div>

      <Card className="overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-candy-red via-candy-yellow to-candy-blue" />
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="text-lg uppercase tracking-widest">{format(monthStart, "MMMM yyyy")}</CardTitle>
          <div className="flex items-center gap-1">
            <Link
              href={`/calendar?month=${prevMonth}`}
              aria-label="Previous month"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "px-2")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>
            <Link
              href={`/calendar?month=${nextMonth}`}
              aria-label="Next month"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "px-2")}
            >
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 pb-1 text-center text-[11px] font-semibold uppercase tracking-wide text-muted">
            {WEEKDAY_LABELS.map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const key = format(day, "yyyy-MM-dd");
              const dayNights = nightsByDay.get(key) ?? [];
              const inMonth = isSameMonth(day, monthStart);
              const today = isToday(day);
              const hasNight = dayNights.length > 0;
              const cell = (
                <div
                  className={cn(
                    "flex aspect-square flex-col items-center justify-center gap-1 rounded-lg text-sm transition-colors",
                    inMonth ? "text-foreground" : "text-muted/40",
                    hasNight && "bg-candy-green font-bold text-tile-foreground shadow-md",
                    !hasNight && today && "ring-2 ring-inset ring-brand",
                    !hasNight && "hover:bg-surface-raised",
                  )}
                >
                  <span>{format(day, "d")}</span>
                  {hasNight && <span className="h-1.5 w-1.5 rounded-full bg-tile-foreground/70" />}
                </div>
              );
              return hasNight ? (
                <Link key={key} href={`/leagues/${dayNights[0].id}`} className="rounded-lg">
                  {cell}
                </Link>
              ) : (
                <div key={key}>{cell}</div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">Upcoming</h2>
        {upcoming.length === 0 ? (
          <Card>
            <CardContent className="pt-5 text-sm text-muted">No upcoming nights scheduled yet.</CardContent>
          </Card>
        ) : (
          upcoming.map((n) => <ScheduleRow key={n.id} night={n} />)
        )}
      </div>

      {past.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">Past</h2>
          {past.map((n) => (
            <ScheduleRow key={n.id} night={n} past />
          ))}
        </div>
      )}
    </div>
  );
}

function ScheduleRow({ night, past = false }: { night: LeagueNight; past?: boolean }) {
  return (
    <Card className={cn("flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between", past && "opacity-70")}>
      <Link href={`/leagues/${night.id}`} className="flex items-center gap-4">
        <div className="flex w-16 shrink-0 flex-col items-center rounded-lg bg-candy-blue py-2 leading-none text-tile-foreground">
          <span className="text-[11px] font-bold uppercase">{format(parseISO(night.date), "MMM")}</span>
          <span className="text-xl font-extrabold">{format(parseISO(night.date), "d")}</span>
        </div>
        <div>
          <p className="font-semibold">{night.courseName}</p>
          <p className="text-sm text-muted">
            {formatDate(night.date)} · {night.dayOfWeek === "tuesday" ? "Tuesday" : "Thursday"} night
          </p>
        </div>
      </Link>
      {!past && (
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={googleCalendarUrl(night)}
            target="_blank"
            rel="noreferrer"
            className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
          >
            Google
          </a>
          <a
            href={outlookCalendarUrl(night)}
            target="_blank"
            rel="noreferrer"
            className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
          >
            Outlook
          </a>
          <a href={`/api/calendar/${night.id}`} className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}>
            <Download className="h-3.5 w-3.5" /> Apple / .ics
          </a>
        </div>
      )}
    </Card>
  );
}
