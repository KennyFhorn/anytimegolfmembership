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
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AddToCalendarButton } from "@/components/add-to-calendar-button";
import { CancelDetailsButton } from "@/components/cancel-details-button";
import { getRepository } from "@/lib/data";
import { getCurrentProfile, hasCoachAccess } from "@/lib/auth";
import { cn, formatDate } from "@/lib/utils";
import { googleCalendarUrl, outlookCalendarUrl } from "@/lib/ics";
import { DEFAULT_GAME_TYPE, GAME_TYPES, gameTypeLabel } from "@/lib/game-types";
import type { LeagueNight } from "@/lib/types";
import { createLeagueNightFromCalendarAction } from "./actions";

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
  const profile = await getCurrentProfile();
  const isAdmin = hasCoachAccess(profile?.role);
  const [nights, courses] = await Promise.all([repo.listLeagueNights(), repo.listCourses()]);

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
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted">Every Tuesday and Thursday night, on the books.</p>
        </div>
      </div>

      {isAdmin && (
        <details className="group">
          <summary
            className={cn(
              "inline-flex w-fit cursor-pointer list-none items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-5 py-2.5 text-sm font-bold text-foreground backdrop-blur-xl transition-all marker:content-none",
              "shadow-[0_16px_32px_-14px_rgba(0,0,0,0.7),0_8px_20px_-8px_var(--candy-green),inset_0_1px_0_0_rgba(255,255,255,0.08)]",
              "hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.08]",
            )}
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-candy-green text-tile-foreground transition-transform group-open:rotate-45">
              <Plus className="h-4 w-4" />
            </span>
            Add a league night
          </summary>
          <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl">
            <form action={createLeagueNightFromCalendarAction} className="grid grid-cols-1 gap-3 sm:grid-cols-6">
              <div className="flex flex-col gap-1">
                <Label htmlFor="date">Date</Label>
                <Input id="date" name="date" type="date" required />
              </div>
              <div className="flex flex-col gap-1 sm:col-span-2">
                <Label htmlFor="courseName">Course</Label>
                <Input
                  id="courseName"
                  name="courseName"
                  required
                  placeholder="Augusta National (TrackMan)"
                  list="course-options"
                  autoComplete="off"
                />
                <datalist id="course-options">
                  {courses.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="coursePar">Par</Label>
                <Input id="coursePar" name="coursePar" type="number" defaultValue={72} />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="capacity">Capacity</Label>
                <Input id="capacity" name="capacity" type="number" defaultValue={20} />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="signupFee">Signup fee (USD)</Label>
                <Input id="signupFee" name="signupFee" type="number" step="0.01" defaultValue={25} />
              </div>
              <div className="flex flex-col gap-1 sm:col-span-2">
                <Label htmlFor="gameType">Game type</Label>
                <Select id="gameType" name="gameType" defaultValue={DEFAULT_GAME_TYPE}>
                  {GAME_TYPES.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="flex flex-wrap gap-2 sm:col-span-6">
                <button
                  type="submit"
                  className={cn(
                    "inline-flex w-fit items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-5 py-2.5 text-sm font-bold text-foreground backdrop-blur-xl transition-all",
                    "shadow-[0_16px_32px_-14px_rgba(0,0,0,0.7),0_8px_20px_-8px_var(--candy-green),inset_0_1px_0_0_rgba(255,255,255,0.08)]",
                    "hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.08] active:translate-y-0",
                  )}
                >
                  Add to calendar
                </button>
                <CancelDetailsButton>Cancel</CancelDetailsButton>
              </div>
            </form>
          </div>
        </details>
      )}

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
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">{night.courseName}</p>
            <Badge variant="brand">{gameTypeLabel(night.gameType)}</Badge>
          </div>
          <p className="text-sm text-muted">
            {formatDate(night.date)} · {night.dayOfWeek === "tuesday" ? "Tuesday" : "Thursday"} night
          </p>
        </div>
      </Link>
      {!past && (
        <AddToCalendarButton
          googleUrl={googleCalendarUrl(night)}
          outlookUrl={outlookCalendarUrl(night)}
          icsUrl={`/api/calendar/${night.id}`}
        />
      )}
    </Card>
  );
}
