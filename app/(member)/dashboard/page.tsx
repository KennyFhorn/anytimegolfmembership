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
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ContentTile, TileGrid, type Tile } from "@/components/tile-grid";
import { getRepository } from "@/lib/data";
import { getCurrentProfile } from "@/lib/auth";
import { formatCents, formatDate } from "@/lib/utils";

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
    {
      href: "/calendar",
      label: "This week",
      sublabel: nextNight ? formatDate(nextNight.date) : "View schedule",
      icon: Flag,
      color: "green",
    },
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
        <ContentTile color="green">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <h3 className="font-bold">Next league night</h3>
          </div>
          {nextNight ? (
            <div className="flex flex-col gap-2">
              <p className="font-semibold">{formatDate(nextNight.date)}</p>
              <p className="text-sm text-tile-foreground/70">{nextNight.courseName}</p>
              <p className="text-sm text-tile-foreground/70">Fee: {formatCents(nextNight.signupFeeCents)}</p>
              {registration ? (
                <span className="w-fit rounded-full border border-tile-foreground/25 bg-tile-foreground/10 px-2.5 py-0.5 text-xs font-medium">
                  {registration.paymentStatus === "paid" ? "Registered & paid" : "Registered — payment pending"}
                </span>
              ) : (
                <Link
                  href={`/leagues/${nextNight.id}`}
                  className="w-fit rounded-md bg-tile-foreground px-3 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                  Register
                </Link>
              )}
            </div>
          ) : (
            <p className="text-sm text-tile-foreground/70">No upcoming night scheduled yet.</p>
          )}
        </ContentTile>

        <ContentTile color="blue">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <h3 className="font-bold">Your group</h3>
          </div>
          {myGroup ? (
            <div className="flex flex-col gap-1">
              <p className="font-semibold">Group {myGroup.groupNumber}</p>
              <p className="text-sm text-tile-foreground/70">Avg handicap {myGroup.avgHandicap?.toFixed(1)}</p>
            </div>
          ) : (
            <p className="text-sm text-tile-foreground/70">Groups haven&apos;t been posted for the next night yet.</p>
          )}
        </ContentTile>

        <ContentTile color="yellow">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            <h3 className="font-bold">Season standing</h3>
          </div>
          {myStanding ? (
            <div className="flex flex-col gap-1">
              <p className="font-semibold">#{myStanding.rank} of {standings.length}</p>
              <p className="text-sm text-tile-foreground/70">{myStanding.totalPoints} pts · {myStanding.wins} wins</p>
            </div>
          ) : (
            <p className="text-sm text-tile-foreground/70">No rounds recorded yet this season.</p>
          )}
        </ContentTile>
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
