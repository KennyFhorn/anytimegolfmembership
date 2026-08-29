import Link from "next/link";
import {
  Calendar,
  CalendarRange,
  Flag,
  Gift,
  History,
  LayoutDashboard,
  Trophy,
  Users,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { IconChip, TileGrid, type Tile } from "@/components/tile-grid";
import { getRepository } from "@/lib/data";
import { getCurrentProfile } from "@/lib/auth";
import { cn, formatCents, formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const repo = await getRepository();
  const profile = await getCurrentProfile();
  const me = profile ? await repo.getMemberByProfileId(profile.id) : null;

  const [nextNight, activeSeason] = await Promise.all([
    repo.getNextLeagueNight(),
    repo.getActiveSeason(),
  ]);

  const [registration, groups, standings] = await Promise.all([
    nextNight && me ? repo.getRegistration(nextNight.id, me.id) : Promise.resolve(null),
    nextNight ? repo.listGroups(nextNight.id) : Promise.resolve([]),
    activeSeason ? repo.getStandings(activeSeason.id) : Promise.resolve([]),
  ]);

  const myGroup = me ? groups.find((g) => g.memberIds.includes(me.id)) : undefined;
  const myStanding = me ? standings.find((s) => s.memberId === me.id) : undefined;
  const isAdmin = profile?.role === "admin";

  const memberTiles: Tile[] = [
    { href: "/standings", label: "Standings", icon: Trophy, color: "yellow" },
    nextNight
      ? { href: `/leagues/${nextNight.id}`, label: "This week", sublabel: formatDate(nextNight.date), icon: Flag, color: "green" }
      : { href: "#", label: "This week", sublabel: "No night scheduled", icon: Flag, color: "green", disabled: true },
    { href: "/history", label: "History", icon: History, color: "purple" },
  ];
  const coachTiles: Tile[] = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard, color: "blue" },
    { href: "/admin/members", label: "Members", icon: Users, color: "pink" },
    { href: "/admin/leagues", label: "League nights", icon: Calendar, color: "orange" },
    { href: "/admin/prizes", label: "Prizes", icon: Gift, color: "teal" },
    { href: "/admin/seasons", label: "Seasons", icon: CalendarRange, color: "red" },
  ];

  if (!me) {
    return (
      <div className="flex flex-col gap-6">
        <TileGrid tiles={memberTiles} />
        {isAdmin && <TileGrid heading="Coach console" tiles={coachTiles} />}
        <Card>
          <CardHeader>
            <CardTitle>No member profile linked</CardTitle>
            <CardDescription>
              Your account isn&apos;t linked to a member record yet. Ask Coach Ryan to add you as a
              member in the admin console.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Welcome back, {me.fullName.split(" ")[0]}</h1>
        <p className="text-muted">Handicap Index: {me.handicapIndex.toFixed(1)}</p>
      </div>

      <TileGrid tiles={memberTiles} />
      {isAdmin && <TileGrid heading="Coach console" tiles={coachTiles} />}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <IconChip color="green">
              <Calendar className="h-5 w-5" />
            </IconChip>
            <CardTitle className="text-base">Next league night</CardTitle>
          </CardHeader>
          <CardContent>
            {nextNight ? (
              <div className="flex flex-col gap-2">
                <p className="font-medium">{formatDate(nextNight.date)}</p>
                <p className="text-sm text-muted">{nextNight.courseName}</p>
                <p className="text-sm text-muted">Fee: {formatCents(nextNight.signupFeeCents)}</p>
                {registration ? (
                  <Badge variant={registration.paymentStatus === "paid" ? "success" : "warning"}>
                    {registration.paymentStatus === "paid" ? "Registered & paid" : "Registered — payment pending"}
                  </Badge>
                ) : (
                  <Link
                    href={`/leagues/${nextNight.id}`}
                    className={cn(buttonVariants({ size: "sm" }), "self-start")}
                  >
                    Register
                  </Link>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted">No upcoming night scheduled yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <IconChip color="blue">
              <Users className="h-5 w-5" />
            </IconChip>
            <CardTitle className="text-base">Your group</CardTitle>
          </CardHeader>
          <CardContent>
            {myGroup ? (
              <div className="flex flex-col gap-1">
                <p className="font-medium">Group {myGroup.groupNumber}</p>
                <p className="text-sm text-muted">Avg handicap {myGroup.avgHandicap?.toFixed(1)}</p>
              </div>
            ) : (
              <p className="text-sm text-muted">Groups haven&apos;t been posted for the next night yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <IconChip color="yellow">
              <Trophy className="h-5 w-5" />
            </IconChip>
            <CardTitle className="text-base">Season standing</CardTitle>
          </CardHeader>
          <CardContent>
            {myStanding ? (
              <div className="flex flex-col gap-1">
                <p className="font-medium">#{myStanding.rank} of {standings.length}</p>
                <p className="text-sm text-muted">{myStanding.totalPoints} pts · {myStanding.wins} wins</p>
              </div>
            ) : (
              <p className="text-sm text-muted">No rounds recorded yet this season.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {nextNight && (
        <Link
          href={`/leagues/${nextNight.id}`}
          className="text-sm font-medium text-brand hover:underline"
        >
          View full night details →
        </Link>
      )}
    </div>
  );
}
