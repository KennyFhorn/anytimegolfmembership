import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";
import { getRepository } from "@/lib/data";

export default async function StandingsPage() {
  const repo = await getRepository();
  const season = await repo.getActiveSeason();
  const standings = season ? await repo.getStandings(season.id) : [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Season Standings</h1>
        <p className="text-muted">{season?.name ?? "No active season"}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
          <CardDescription>Ranked by total points across every league night this season</CardDescription>
        </CardHeader>
        <CardContent>
          {standings.length === 0 ? (
            <p className="text-sm text-muted">No rounds recorded yet this season.</p>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Rank</TableHeaderCell>
                  <TableHeaderCell>Player</TableHeaderCell>
                  <TableHeaderCell>Handicap</TableHeaderCell>
                  <TableHeaderCell>Rounds</TableHeaderCell>
                  <TableHeaderCell>Wins</TableHeaderCell>
                  <TableHeaderCell>Avg Net</TableHeaderCell>
                  <TableHeaderCell>Points</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {standings.map((row) => (
                  <TableRow key={row.memberId}>
                    <TableCell className="font-semibold">
                      {row.rank <= 3 ? <Badge variant="gold">#{row.rank}</Badge> : `#${row.rank}`}
                    </TableCell>
                    <TableCell>{row.fullName}</TableCell>
                    <TableCell>{row.handicapIndex.toFixed(1)}</TableCell>
                    <TableCell>{row.roundsPlayed}</TableCell>
                    <TableCell>{row.wins}</TableCell>
                    <TableCell>{row.avgNetScore?.toFixed(1) ?? "—"}</TableCell>
                    <TableCell className="font-semibold">{row.totalPoints}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
