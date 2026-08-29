import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";
import { getRepository } from "@/lib/data";
import { formatCents, formatDate } from "@/lib/utils";
import { gameTypeLabel } from "@/lib/game-types";
import {
  adminRegisterMemberAction,
  generateGroupsAction,
  saveScoresAction,
  setPaymentStatusAction,
  swapGroupMembersAction,
} from "./actions";

export default async function AdminLeagueNightPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const repo = await getRepository();
  const night = await repo.getLeagueNight(id);
  if (!night) notFound();

  const [registrations, groups, scores, allMembers] = await Promise.all([
    repo.listRegistrations(id),
    repo.listGroups(id),
    repo.listScores(id),
    repo.listMembers(),
  ]);

  const memberById = new Map(allMembers.map((m) => [m.id, m]));
  const scoreByMember = new Map(scores.map((s) => [s.memberId, s]));
  const paidRegistrations = registrations.filter((r) => r.paymentStatus === "paid" && r.status === "registered");
  const registeredMemberIds = new Set(registrations.map((r) => r.memberId));
  const unregisteredMembers = allMembers.filter((m) => m.active && !registeredMemberIds.has(m.id));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm text-muted">{night.dayOfWeek === "tuesday" ? "Tuesday" : "Thursday"} Member Night</p>
        <h1 className="text-2xl font-bold tracking-tight">{formatDate(night.date)}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-muted">
            {night.courseName} · Par {night.coursePar} · Fee {formatCents(night.signupFeeCents)}
          </p>
          <Badge variant="brand">{gameTypeLabel(night.gameType)}</Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registrations</CardTitle>
          <CardDescription>
            {registrations.length} / {night.capacity} · {paidRegistrations.length} paid
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {unregisteredMembers.length > 0 && (
            <form action={adminRegisterMemberAction.bind(null, id)} className="flex flex-wrap items-end gap-2">
              <Select name="memberId" defaultValue="" required className="w-56">
                <option value="" disabled>
                  Add a member…
                </option>
                {unregisteredMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.fullName}
                  </option>
                ))}
              </Select>
              <Button type="submit" size="sm" variant="secondary">
                Register &amp; mark paid
              </Button>
            </form>
          )}

          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Member</TableHeaderCell>
                <TableHeaderCell>Handicap</TableHeaderCell>
                <TableHeaderCell>Payment</TableHeaderCell>
                <TableHeaderCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {registrations.map((reg) => {
                const member = memberById.get(reg.memberId);
                return (
                  <TableRow key={reg.id}>
                    <TableCell className="font-medium">{member?.fullName ?? "—"}</TableCell>
                    <TableCell>{member?.handicapIndex.toFixed(1)}</TableCell>
                    <TableCell>
                      <Badge variant={reg.paymentStatus === "paid" ? "success" : "warning"}>
                        {reg.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {reg.paymentStatus !== "paid" ? (
                        <form action={setPaymentStatusAction.bind(null, reg.id, "paid", id)}>
                          <Button type="submit" size="sm" variant="ghost">
                            Mark paid
                          </Button>
                        </form>
                      ) : (
                        <form action={setPaymentStatusAction.bind(null, reg.id, "pending", id)}>
                          <Button type="submit" size="sm" variant="ghost">
                            Mark pending
                          </Button>
                        </form>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Groups</CardTitle>
          <CardDescription>Auto-balanced by handicap from paid registrations. Regenerating replaces the current groups.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <form action={generateGroupsAction.bind(null, id)}>
            <Button type="submit" disabled={paidRegistrations.length === 0}>
              {groups.length > 0 ? "Regenerate groups" : "Generate groups"}
            </Button>
          </form>

          {groups.length > 0 && (
            <>
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

              <div className="flex flex-col gap-2 rounded-lg border border-border p-4">
                <p className="text-sm font-medium">Manual swap</p>
                <form
                  action={async (formData: FormData) => {
                    "use server";
                    await swapGroupMembersAction(
                      id,
                      String(formData.get("memberA")),
                      String(formData.get("memberB")),
                    );
                  }}
                  className="flex flex-wrap items-end gap-2"
                >
                  <Select name="memberA" defaultValue="" required className="w-56">
                    <option value="" disabled>
                      Player A
                    </option>
                    {groups.flatMap((g) =>
                      g.memberIds.map((mid) => (
                        <option key={mid} value={mid}>
                          {memberById.get(mid)?.fullName} (Group {g.groupNumber})
                        </option>
                      )),
                    )}
                  </Select>
                  <Select name="memberB" defaultValue="" required className="w-56">
                    <option value="" disabled>
                      Player B
                    </option>
                    {groups.flatMap((g) =>
                      g.memberIds.map((mid) => (
                        <option key={mid} value={mid}>
                          {memberById.get(mid)?.fullName} (Group {g.groupNumber})
                        </option>
                      )),
                    )}
                  </Select>
                  <Button type="submit" size="sm" variant="secondary">
                    Swap
                  </Button>
                </form>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {paidRegistrations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Score entry</CardTitle>
            <CardDescription>Enter gross scores; net score, position, and points are calculated automatically.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={saveScoresAction.bind(null, id)} className="flex flex-col gap-3">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Player</TableHeaderCell>
                    <TableHeaderCell>Handicap</TableHeaderCell>
                    <TableHeaderCell>Gross score</TableHeaderCell>
                    <TableHeaderCell>Last posted net / pos</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paidRegistrations.map((reg) => {
                    const member = memberById.get(reg.memberId);
                    const existing = scoreByMember.get(reg.memberId);
                    return (
                      <TableRow key={reg.id}>
                        <TableCell className="font-medium">{member?.fullName}</TableCell>
                        <TableCell>{member?.handicapIndex.toFixed(1)}</TableCell>
                        <TableCell>
                          <Input
                            name={`score_${reg.memberId}`}
                            type="number"
                            className="h-8 w-24"
                            defaultValue={existing?.grossScore ?? ""}
                          />
                        </TableCell>
                        <TableCell className="text-muted">
                          {existing ? `${existing.netScore} / #${existing.position}` : "—"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <Button type="submit" className="self-start">
                Save scores &amp; close out the night
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
