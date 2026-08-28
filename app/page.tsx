import Link from "next/link";
import { Flag, LayoutDashboard, MonitorPlay, ShieldCheck, Trophy } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { isDemoMode } from "@/lib/data";

const sections = [
  {
    href: "/dashboard",
    icon: LayoutDashboard,
    title: "Member Dashboard",
    description: "Your handicap, your group, upcoming league nights, and season standings.",
  },
  {
    href: "/standings",
    icon: Trophy,
    title: "Season Standings",
    description: "Full league leaderboard, points, and wins for the active season.",
  },
  {
    href: "/admin",
    icon: ShieldCheck,
    title: "Coach Console",
    description: "Manage members, league nights, groups, scores, and prizes.",
  },
  {
    href: "/tv/leaderboard",
    icon: MonitorPlay,
    title: "Studio TV Display",
    description: "Fullscreen kiosk views for the 48\" OLED displays around the studio.",
  },
];

export default function Home() {
  const demo = isDemoMode();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-4 py-16 sm:px-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-brand-foreground">
          <Flag className="h-7 w-7" />
        </span>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Anytime Golf League Nights</h1>
        <p className="max-w-xl text-muted">
          Tuesday and Thursday Trackman league management — registration, handicaps, balanced
          groups, weekly scores, standings, and prizes.
        </p>
        {demo && (
          <Badge variant="gold">
            Running in demo mode with sample data — connect Supabase to go live
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {sections.map((s) => (
          <Link key={s.href} href={s.href}>
            <Card className="h-full transition-colors hover:border-brand">
              <CardHeader>
                <s.icon className="mb-2 h-6 w-6 text-brand" />
                <CardTitle>{s.title}</CardTitle>
                <CardDescription>{s.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
