import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";
import { getRepository } from "@/lib/data";
import { getCurrentProfile } from "@/lib/auth";
import { formatCents, formatDate } from "@/lib/utils";
import { gameTypeLabel } from "@/lib/game-types";
import { registerForNight } from "./actions";

export default async function LeagueNightPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ paid?: string; simulated?: string; error?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const repo = await getRepository();
  const night = await repo.getLeagueNight(id);
  if (!night) notFound();

  const profile = await getCurrentProfile();
  const me = profile ? await repo.getMemberByProfileId(profile.id) : null;

  const [registrations, groups, scores, allMembers] = await Promise.all([
    repo.listRegistrations(id),
    repo.listGroups(id),
    repo.listScores(id),
    repo.listMembers(),
  ]);

  const memberById = new Map(allMembers.map((m) => [m.id, m]));
  const myRegistration = me ? registrations.find((r) => r.memberId === me.id) : undefined;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm text-muted">{night.dayOfWeek === "tuesday" ? "Tuesday" : "Thursday"} League Night</p>
        <h1 className="text-2xl font-bold tracking-tight">{formatDate(night.date)}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-muted">{night.courseName} · Par {night.coursePar}</p>
          <Badge variant="brand">{gameTypeLabel(night.gameType)}</Badge>
        </div>
      </div>

      {query.paid && (
        <Card className="border-emerald-700 bg-emerald-950/40">
          <CardContent className="py-4 text-sm text-emerald-300">
            You&apos;re registered and paid{query.simulated ? " (simulated — no Stripe keys configured yet)" : ""}. See
            you on the tee!
          </CardContent>
        </Card>
      )}
      {query.error && (
        <Card className="border-red-800 bg-red-950/40">
          <CardContent className="py-4 text-sm text-red-300">
            We couldn&apos;t find a member profile linked to your account. Ask Coach Ryan to link you in
            the admin console.
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Registration</CardTitle>
          <CardDescription>
            {registrations.length} / {night.capacity} registered · Fee {formatCents(night.signupFeeCents)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {myRegistration ? (
            <Badge variant={myRegistration.paymentStatus === "paid" ? "success" : "warning"}>
              {myRegistration.paymentStatus === "paid" ? "You're registered & paid" : "Registered — payment pending"}
            </Badge>
          ) : (
            <form action={registerForNight}>
              <input type="hidden" name="leagueNightId" value={night.id} />
              <Button type="submit" disabled={night.status !== "upcoming"}>
                Register & pay {formatCents(night.signupFeeCents)}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {groups.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Groups</CardTitle>
            <CardDescription>Balanced by handicap into foursomes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {groups
                .sort((a, b) => a.groupNumber - b.groupNumber)
                .map((g) => (
                  <div key={g.id} className="rounded-lg border border-border p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="font-semibold">Group {g.groupNumber}</p>
                      <Badge>{g.avgHandicap?.toFixed(1)} avg</Badge>
                    </div>
                    <ul className="flex flex-col gap-1 text-sm text-muted">
                      {g.memberIds.map((mid) => (
                        <li key={mid}>{memberById.get(mid)?.fullName ?? "—"}</li>
                      ))}
                    </ul>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {scores.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Pos</TableHeaderCell>
                  <TableHeaderCell>Player</TableHeaderCell>
                  <TableHeaderCell>Gross</TableHeaderCell>
                  <TableHeaderCell>Net</TableHeaderCell>
                  <TableHeaderCell>Points</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[...scores]
                  .sort((a, b) => (a.position ?? 99) - (b.position ?? 99))
                  .map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>{s.position}</TableCell>
                      <TableCell>{memberById.get(s.memberId)?.fullName ?? "—"}</TableCell>
                      <TableCell>{s.grossScore}</TableCell>
                      <TableCell>{s.netScore}</TableCell>
                      <TableCell>{s.points}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      {scores.length === 0 && (
        <p className="text-sm text-muted">Scores haven&apos;t been posted for this night yet.</p>
      )}
    </div>
  );
}
