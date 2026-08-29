import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";
import { getRepository } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import { createMemberAction, toggleMemberActiveAction, updateHandicapAction } from "./actions";

export default async function AdminMembersPage() {
  const repo = await getRepository();
  const members = await repo.listMembers();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Members</h1>
        <p className="text-muted">{members.length} total · {members.filter((m) => m.active).length} active</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add a member</CardTitle>
          <CardDescription>New members start at an 18.0 handicap until their first round.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createMemberAction} className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <div className="flex flex-col gap-1">
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" name="firstName" required placeholder="Jordan" />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" name="lastName" required placeholder="Sullivan" />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required placeholder="jordan@example.com" />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" placeholder="(555) 555-0100" />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="address">Address (optional)</Label>
              <Input id="address" name="address" placeholder="123 Fairway Dr" />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="birthdate">Birthdate (optional)</Label>
              <Input id="birthdate" name="birthdate" type="date" max={new Date().toISOString().slice(0, 10)} />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="gender">Gender (optional)</Label>
              <Select id="gender" name="gender" defaultValue="">
                <option value="">—</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="nonbinary">Nonbinary</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="handicapIndex">Starting handicap</Label>
              <Input id="handicapIndex" name="handicapIndex" type="number" step="0.1" defaultValue={18} />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="yearStartedGolf">Year started golf (optional)</Label>
              <Input id="yearStartedGolf" name="yearStartedGolf" type="number" min="1930" placeholder="2015" />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="emergencyContactName">Emergency contact name</Label>
              <Input id="emergencyContactName" name="emergencyContactName" placeholder="Full name" />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="emergencyContactPhone">Emergency contact phone</Label>
              <Input id="emergencyContactPhone" name="emergencyContactPhone" placeholder="(555) 987-6543" />
            </div>
            <Button type="submit" className="sm:col-span-4 sm:w-fit">
              Add member
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Roster</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Name</TableHeaderCell>
                <TableHeaderCell>Email</TableHeaderCell>
                <TableHeaderCell>Phone</TableHeaderCell>
                <TableHeaderCell>Birthdate</TableHeaderCell>
                <TableHeaderCell>Gender</TableHeaderCell>
                <TableHeaderCell>Started golf</TableHeaderCell>
                <TableHeaderCell>Emergency contact</TableHeaderCell>
                <TableHeaderCell>Handicap</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Actions</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.fullName}</TableCell>
                  <TableCell className="text-muted">{member.email}</TableCell>
                  <TableCell className="text-muted">{member.phone ?? "—"}</TableCell>
                  <TableCell className="text-muted">
                    {member.birthdate ? formatDate(member.birthdate) : "—"}
                  </TableCell>
                  <TableCell className="text-muted capitalize">
                    {member.gender ? member.gender.replace(/_/g, " ") : "—"}
                  </TableCell>
                  <TableCell className="text-muted">{member.yearStartedGolf ?? "—"}</TableCell>
                  <TableCell className="text-muted">
                    {member.emergencyContactName ? (
                      <span>
                        {member.emergencyContactName}
                        {member.emergencyContactPhone && ` · ${member.emergencyContactPhone}`}
                      </span>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    <form action={updateHandicapAction} className="flex items-center gap-2">
                      <input type="hidden" name="memberId" value={member.id} />
                      <Input
                        name="handicapIndex"
                        type="number"
                        step="0.1"
                        defaultValue={member.handicapIndex}
                        className="h-8 w-20"
                      />
                      <Button type="submit" size="sm" variant="secondary">
                        Save
                      </Button>
                    </form>
                  </TableCell>
                  <TableCell>
                    <Badge variant={member.active ? "success" : "default"}>
                      {member.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <form action={toggleMemberActiveAction.bind(null, member.id, !member.active)}>
                      <Button type="submit" size="sm" variant="ghost">
                        {member.active ? "Deactivate" : "Reactivate"}
                      </Button>
                    </form>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
