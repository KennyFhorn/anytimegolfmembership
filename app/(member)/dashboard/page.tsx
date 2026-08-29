import Link from "next/link";
import {
  Calendar,
  CalendarRange,
  Gift,
  History,
  LayoutDashboard,
  Trophy,
  Users,
} from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { ContentTile, IconBadge, TileGrid, type Tile } from "@/components/tile-grid";
import { getRepository } from "@/lib/data";
import { getCurrentProfile, hasCoachAccess } from "@/lib/auth";
import { cn, formatCents, formatDate } from "@/lib/utils";

export default async function DashboardPage({ searchParams }: PageProps<"/dashboard">) {
  const { view } = await searchParams;
  const repo = await getRepository();
  const profile = await getCurrentProfile();
  const me = profile ? await repo.getMemberByProfileId(profile.id) : null;
  const isAdmin = hasCoachAccess(profile?.role);
  // Admins land on the coach console by default — pass ?view=player to see
  // the same dashboard a regular member gets, via the button below.
  const showPlayerView = !isAdmin || view === "player";

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

  const memberTiles: Tile[] = [
    { href: "/standings", label: "Standings", icon: Trophy, color: "yellow" },
    {
      href: "/calendar",
      label: "Calendar",
      sublabel: nextNight ? formatDate(nextNight.date) : "View schedule",
      icon: Calendar,
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {showPlayerView && me ? `Welcome back, ${me.fullName.split(" ")[0]}` : "Coach console"}
          </h1>
          <p className="text-muted">
            {showPlayerView && me ? `Handicap Index: ${me.handicapIndex.toFixed(1)}` : "Everything for running league night."}
          </p>
        </div>
        {isAdmin && (
          <Link
            href={showPlayerView ? "/dashboard" : "/dashboard?view=player"}
            className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
          >
            {showPlayerView ? "Back to coach console" : "Show my player dashboard"}
          </Link>
        )}
      </div>

      {showPlayerView ? (
        <>
          <TileGrid tiles={memberTiles} />

          {!me ? (
            <Card>
              <CardHeader>
                <CardTitle>No member profile linked</CardTitle>
                <CardDescription>
                  Your account isn&apos;t linked to a member record yet. Ask Coach Ryan to add you as
                  a member in the admin console.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <ContentTile color="green">
                  <div className="flex items-center gap-2">
                    <IconBadge color="green" size="sm">
                      <Calendar className="h-4 w-4" />
                    </IconBadge>
                    <h3 className="font-bold">Next league night</h3>
                  </div>
                  {nextNight ? (
                    <div className="flex flex-col gap-2">
                      <p className="font-semibold">{formatDate(nextNight.date)}</p>
                      <p className="text-sm text-muted">{nextNight.courseName}</p>
                      <p className="text-sm text-muted">Fee: {formatCents(nextNight.signupFeeCents)}</p>
                      {registration ? (
                        <Badge variant={registration.paymentStatus === "paid" ? "success" : "warning"} className="w-fit">
                          {registration.paymentStatus === "paid" ? "Registered & paid" : "Registered — payment pending"}
                        </Badge>
                      ) : (
                        <Link href={`/leagues/${nextNight.id}`} className={cn(buttonVariants({ size: "sm" }), "w-fit")}>
                          Register
                        </Link>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted">No upcoming night scheduled yet.</p>
                  )}
                </ContentTile>

                <ContentTile color="blue">
                  <div className="flex items-center gap-2">
                    <IconBadge color="blue" size="sm">
                      <Users className="h-4 w-4" />
                    </IconBadge>
                    <h3 className="font-bold">Your group</h3>
                  </div>
                  {myGroup ? (
                    <div className="flex flex-col gap-1">
                      <p className="font-semibold">Group {myGroup.groupNumber}</p>
                      <p className="text-sm text-muted">Avg handicap {myGroup.avgHandicap?.toFixed(1)}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted">Groups haven&apos;t been posted for the next night yet.</p>
                  )}
                </ContentTile>

                <ContentTile color="yellow">
                  <div className="flex items-center gap-2">
                    <IconBadge color="yellow" size="sm">
                      <Trophy className="h-4 w-4" />
                    </IconBadge>
                    <h3 className="font-bold">Season standing</h3>
                  </div>
                  {myStanding ? (
                    <div className="flex flex-col gap-1">
                      <p className="font-semibold">#{myStanding.rank} of {standings.length}</p>
                      <p className="text-sm text-muted">{myStanding.totalPoints} pts · {myStanding.wins} wins</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted">No rounds recorded yet this season.</p>
                  )}
                </ContentTile>
              </div>

              {nextNight && (
                <Link href={`/leagues/${nextNight.id}`} className="text-sm font-medium text-brand hover:underline">
                  View full night details →
                </Link>
              )}
            </>
          )}
        </>
      ) : (
        <TileGrid tiles={coachTiles} />
      )}
    </div>
  );
}
