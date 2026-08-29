import { Award, History as HistoryIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";
import { getRepository } from "@/lib/data";
import { getCurrentProfile } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import type { Group, LeagueNight, Prize, Registration, Score } from "@/lib/types";

interface NightHistoryRow {
  night: LeagueNight;
  registration: Registration | null;
  score: Score | null;
  group: Group | null;
  prizes: Prize[];
}

export default async function HistoryPage() {
  const repo = await getRepository();
  const profile = await getCurrentProfile();
  const me = profile ? await repo.getMemberByProfileId(profile.id) : null;

  if (!me) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No member profile linked</CardTitle>
          <CardDescription>
            Your account isn&apos;t linked to a member record yet. Ask Coach Ryan to add you as a
            member in the admin console.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const [nights, prizes] = await Promise.all([repo.listLeagueNights(), repo.listPrizes()]);

  const rows: NightHistoryRow[] = await Promise.all(
    nights.map(async (night): Promise<NightHistoryRow> => {
      const [registration, scores, groups] = await Promise.all([
        repo.getRegistration(night.id, me.id),
        repo.listScores(night.id),
        repo.listGroups(night.id),
      ]);
      return {
        night,
        registration,
        score: scores.find((s) => s.memberId === me.id) ?? null,
        group: groups.find((g) => g.memberIds.includes(me.id)) ?? null,
        prizes: prizes.filter((p) => p.leagueNightId === night.id && p.winnerMemberId === me.id),
      };
    }),
  );

  // Only nights this member actually took part in.
  const played = rows.filter((r) => r.registration || r.score);
  const seasonPrizes = prizes.filter((p) => p.seasonId && p.winnerMemberId === me.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">History</h1>
        <p className="text-muted">Every league night you&apos;ve played, your results, and prizes won.</p>
      </div>

      <Card>
        <CardHeader>
          <HistoryIcon className="mb-1 h-5 w-5 text-candy-purple" />
          <CardTitle>League nights</CardTitle>
        </CardHeader>
        <CardContent>
          {played.length === 0 ? (
            <p className="text-sm text-muted">No league nights on record yet.</p>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Date</TableHeaderCell>
                  <TableHeaderCell>Course</TableHeaderCell>
                  <TableHeaderCell>Group</TableHeaderCell>
                  <TableHeaderCell>Net score</TableHeaderCell>
                  <TableHeaderCell>Position</TableHeaderCell>
                  <TableHeaderCell>Points</TableHeaderCell>
                  <TableHeaderCell>Prize</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {played.map((row) => (
                  <TableRow key={row.night.id}>
                    <TableCell className="font-medium">{formatDate(row.night.date)}</TableCell>
                    <TableCell className="text-muted">{row.night.courseName}</TableCell>
                    <TableCell className="text-muted">
                      {row.group ? `Group ${row.group.groupNumber}` : "—"}
                    </TableCell>
                    <TableCell className="text-muted">{row.score ? row.score.netScore.toFixed(1) : "—"}</TableCell>
                    <TableCell className="text-muted">{row.score?.position ? `#${row.score.position}` : "—"}</TableCell>
                    <TableCell className="text-muted">{row.score ? row.score.points.toFixed(1) : "—"}</TableCell>
                    <TableCell>
                      {row.prizes.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {row.prizes.map((p) => (
                            <Badge key={p.id} variant="gold">
                              {p.title}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Award className="mb-1 h-5 w-5 text-gold" />
          <CardTitle>Season prizes</CardTitle>
        </CardHeader>
        <CardContent>
          {seasonPrizes.length === 0 ? (
            <p className="text-sm text-muted">No season-level prizes won yet.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {seasonPrizes.map((p) => (
                <li key={p.id} className="flex items-center gap-2 text-sm">
                  <Badge variant="gold">{p.title}</Badge>
                  {p.notes && <span className="text-muted">{p.notes}</span>}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
