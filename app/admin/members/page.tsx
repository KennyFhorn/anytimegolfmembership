import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";
import { getRepository } from "@/lib/data";
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
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" name="fullName" required placeholder="Jordan Sullivan" />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required placeholder="jordan@example.com" />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input id="phone" name="phone" placeholder="(555) 555-0100" />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="handicapIndex">Starting handicap</Label>
              <Input id="handicapIndex" name="handicapIndex" type="number" step="0.1" defaultValue={18} />
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
