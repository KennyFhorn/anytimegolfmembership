import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { getRepository } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import { createPrizeAction } from "./actions";

export default async function AdminPrizesPage() {
  const repo = await getRepository();
  const [prizes, members, leagueNights, seasons] = await Promise.all([
    repo.listPrizes(),
    repo.listMembers(),
    repo.listLeagueNights(),
    repo.listSeasons(),
  ]);

  const memberById = new Map(members.map((m) => [m.id, m]));
  const nightById = new Map(leagueNights.map((n) => [n.id, n]));
  const seasonById = new Map(seasons.map((s) => [s.id, s]));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Prizes &amp; Winners</h1>
        <p className="text-muted">Nightly awards and season-long trophies</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add a prize</CardTitle>
          <CardDescription>Attach it to a single night (e.g. Low Net, Longest Drive) or the whole season.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createPrizeAction} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor="scope">Scope</Label>
              <Select id="scope" name="scope" defaultValue="night">
                <option value="night">Single league night</option>
                <option value="season">Season</option>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="leagueNightId">League night (if scoped to a night)</Label>
              <Select id="leagueNightId" name="leagueNightId" defaultValue="">
                <option value="">—</option>
                {leagueNights.map((n) => (
                  <option key={n.id} value={n.id}>
                    {formatDate(n.date)} · {n.courseName}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="seasonId">Season (if scoped to a season)</Label>
              <Select id="seasonId" name="seasonId" defaultValue="">
                <option value="">—</option>
                {seasons.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" required placeholder="Low Net" />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="place">Place (optional)</Label>
              <Input id="place" name="place" type="number" placeholder="1" />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="winnerMemberId">Winner (optional)</Label>
              <Select id="winnerMemberId" name="winnerMemberId" defaultValue="">
                <option value="">Not decided yet</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.fullName}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-1 sm:col-span-3">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Input id="notes" name="notes" placeholder="Sponsored by the pro shop" />
            </div>
            <Button type="submit" className="sm:col-span-3 sm:w-fit">
              Add prize
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {prizes.map((prize) => (
          <Card key={prize.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{prize.title}</CardTitle>
                {prize.place && <Badge variant="gold">#{prize.place}</Badge>}
              </div>
              <CardDescription>
                {prize.leagueNightId
                  ? `${formatDate(nightById.get(prize.leagueNightId)?.date ?? "")} · ${nightById.get(prize.leagueNightId)?.courseName ?? ""}`
                  : seasonById.get(prize.seasonId ?? "")?.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Winner:{" "}
                <span className="font-medium">
                  {prize.winnerMemberId ? memberById.get(prize.winnerMemberId)?.fullName : "Not decided yet"}
                </span>
              </p>
              {prize.notes && <p className="mt-1 text-sm text-muted">{prize.notes}</p>}
            </CardContent>
          </Card>
        ))}
        {prizes.length === 0 && <p className="text-sm text-muted">No prizes added yet.</p>}
      </div>
    </div>
  );
}
