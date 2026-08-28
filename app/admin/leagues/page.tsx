import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";
import { getRepository } from "@/lib/data";
import { formatCents, formatDate } from "@/lib/utils";
import { createLeagueNightAction } from "./actions";

const STATUS_VARIANT = {
  upcoming: "brand",
  in_progress: "warning",
  completed: "default",
} as const;

export default async function AdminLeaguesPage() {
  const repo = await getRepository();
  const nights = await repo.listLeagueNights();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">League Nights</h1>
        <p className="text-muted">Tuesday and Thursday sessions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Schedule a night</CardTitle>
          <CardDescription>Day of week is inferred from the date you pick.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createLeagueNightAction} className="grid grid-cols-1 gap-3 sm:grid-cols-5">
            <div className="flex flex-col gap-1">
              <Label htmlFor="date">Date</Label>
              <Input id="date" name="date" type="date" required />
            </div>
            <div className="flex flex-col gap-1 sm:col-span-2">
              <Label htmlFor="courseName">Course</Label>
              <Input id="courseName" name="courseName" required placeholder="Augusta National (TrackMan)" />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="coursePar">Par</Label>
              <Input id="coursePar" name="coursePar" type="number" defaultValue={72} />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="capacity">Capacity</Label>
              <Input id="capacity" name="capacity" type="number" defaultValue={20} />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="signupFee">Signup fee (USD)</Label>
              <Input id="signupFee" name="signupFee" type="number" step="0.01" defaultValue={25} />
            </div>
            <Button type="submit" className="sm:col-span-5 sm:w-fit">
              Create league night
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All nights</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Date</TableHeaderCell>
                <TableHeaderCell>Course</TableHeaderCell>
                <TableHeaderCell>Fee</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {nights.map((night) => (
                <TableRow key={night.id}>
                  <TableCell className="font-medium">{formatDate(night.date)}</TableCell>
                  <TableCell className="text-muted">{night.courseName}</TableCell>
                  <TableCell>{formatCents(night.signupFeeCents)}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[night.status]}>{night.status.replace("_", " ")}</Badge>
                  </TableCell>
                  <TableCell>
                    <Link href={`/admin/leagues/${night.id}`} className="text-sm font-medium text-brand hover:underline">
                      Manage →
                    </Link>
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
