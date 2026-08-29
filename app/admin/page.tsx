import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getRepository } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export default async function AdminOverviewPage() {
  const repo = await getRepository();
  const [members, nextNight, season] = await Promise.all([
    repo.listMembers(),
    repo.getNextLeagueNight(),
    repo.getActiveSeason(),
  ]);

  const registrations = nextNight ? await repo.listRegistrations(nextNight.id) : [];
  const paidCount = registrations.filter((r) => r.paymentStatus === "paid").length;
  const pendingCount = registrations.filter((r) => r.paymentStatus === "pending").length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Coach Console</h1>
        <p className="text-muted">{season?.name ?? "No active season set"}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Active members</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{members.filter((m) => m.active).length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Next member night</CardTitle>
          </CardHeader>
          <CardContent>
            {nextNight ? (
              <div className="flex flex-col gap-1">
                <p className="font-medium">{formatDate(nextNight.date)}</p>
                <p className="text-sm text-muted">{nextNight.courseName}</p>
              </div>
            ) : (
              <p className="text-sm text-muted">None scheduled</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Badge variant="success">{paidCount} paid</Badge>
              <Badge variant="warning">{pendingCount} pending</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {nextNight && (
        <Link href={`/admin/leagues/${nextNight.id}`} className="text-sm font-medium text-brand hover:underline">
          Manage next member night →
        </Link>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Members</CardTitle>
            <CardDescription>Add members, set handicaps, deactivate no-shows</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/members" className="text-sm font-medium text-brand hover:underline">
              Manage members →
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Member nights</CardTitle>
            <CardDescription>Schedule Tuesday/Thursday nights and courses</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/leagues" className="text-sm font-medium text-brand hover:underline">
              Manage member nights →
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
