import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { getRepository } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import { createSeasonAction, setActiveSeasonAction } from "./actions";

export default async function AdminSeasonsPage() {
  const repo = await getRepository();
  const seasons = await repo.listSeasons();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Seasons</h1>
        <p className="text-muted">Standings reset per season. Only one season is active at a time.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Start a new season</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createSeasonAction} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required placeholder="Winter 2027 League" />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="startDate">Start date</Label>
              <Input id="startDate" name="startDate" type="date" required />
            </div>
            <Button type="submit" className="self-end sm:w-fit">
              Create season
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        {seasons.map((season) => (
          <Card key={season.id}>
            <CardContent className="flex items-center justify-between py-4">
              <div>
                <p className="font-medium">{season.name}</p>
                <CardDescription>Starts {formatDate(season.startDate)}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {season.isActive ? (
                  <Badge variant="success">Active</Badge>
                ) : (
                  <form action={setActiveSeasonAction.bind(null, season.id)}>
                    <Button type="submit" size="sm" variant="secondary">
                      Make active
                    </Button>
                  </form>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
