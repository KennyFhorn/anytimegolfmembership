import { notFound } from "next/navigation";
import Link from "next/link";
import { Crown, Shield, User as UserIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { getRepository } from "@/lib/data";
import { cn, splitFullName } from "@/lib/utils";
import { updateMemberAction, updateMemberRoleAction } from "../actions";

export default async function EditMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const repo = await getRepository();
  const member = await repo.getMember(id);
  if (!member) notFound();
  const currentRole = member.profileId ? await repo.getMemberRole(member.id) : null;

  // Rows created before first_name/last_name existed as their own columns
  // have them as null even though full_name is set — fall back to
  // splitting it so this form isn't blank for those.
  const fallbackName = !member.firstName && !member.lastName ? splitFullName(member.fullName) : null;
  const firstName = member.firstName ?? fallbackName?.first ?? "";
  const lastName = member.lastName ?? fallbackName?.last ?? "";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/members" className="text-sm text-muted hover:text-foreground">
          ← Back to roster
        </Link>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Edit {member.fullName}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Role &amp; permissions</CardTitle>
          <CardDescription>
            Only admins and owners can change this. Users can only ever edit their own profile.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!member.profileId ? (
            <p className="text-sm text-muted">
              This member hasn&apos;t created a login yet — role &amp; permissions apply once they sign up.
            </p>
          ) : (
            <form action={updateMemberRoleAction.bind(null, member.id)} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <label
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur-xl transition-all",
                    "hover:border-white/20 hover:bg-white/[0.08]",
                    "has-[:checked]:border-white/30 has-[:checked]:bg-white/[0.1] has-[:checked]:shadow-[0_10px_28px_-12px_var(--candy-blue)]",
                  )}
                >
                  <input type="radio" name="role" value="member" defaultChecked={currentRole === "member"} className="sr-only" />
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-candy-blue text-tile-foreground">
                    <UserIcon className="h-5 w-5" />
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold">User</span>
                    <span className="text-xs text-muted">Signs up for nights, tracks their own handicap.</span>
                  </div>
                </label>

                <label
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur-xl transition-all",
                    "hover:border-white/20 hover:bg-white/[0.08]",
                    "has-[:checked]:border-white/30 has-[:checked]:bg-white/[0.1] has-[:checked]:shadow-[0_10px_28px_-12px_var(--candy-orange)]",
                  )}
                >
                  <input type="radio" name="role" value="admin" defaultChecked={currentRole === "admin"} className="sr-only" />
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-candy-orange text-tile-foreground">
                    <Shield className="h-5 w-5" />
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold">Admin</span>
                    <span className="text-xs text-muted">Full Coach console — members, nights, prizes, seasons.</span>
                  </div>
                </label>

                <label
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur-xl transition-all",
                    "hover:border-white/20 hover:bg-white/[0.08]",
                    "has-[:checked]:border-white/30 has-[:checked]:bg-white/[0.1] has-[:checked]:shadow-[0_10px_28px_-12px_var(--candy-yellow)]",
                  )}
                >
                  <input type="radio" name="role" value="owner" defaultChecked={currentRole === "owner"} className="sr-only" />
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-candy-yellow text-tile-foreground">
                    <Crown className="h-5 w-5" />
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold">Owner</span>
                    <span className="text-xs text-muted">Everything Admin can, plus changing other members&apos; roles.</span>
                  </div>
                </label>
              </div>
              <Button type="submit" className="w-fit">
                Update role
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Member details</CardTitle>
          <CardDescription>Every field a member fills in at signup can be corrected here.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateMemberAction.bind(null, member.id)} className="flex flex-col gap-5">
            <FormSection title="Name">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="First name" htmlFor="firstName">
                  <Input id="firstName" name="firstName" required defaultValue={firstName} />
                </Field>
                <Field label="Last name" htmlFor="lastName">
                  <Input id="lastName" name="lastName" required defaultValue={lastName} />
                </Field>
              </div>
            </FormSection>

            <FormSection title="Personal">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Birthdate" htmlFor="birthdate">
                  <Input
                    id="birthdate"
                    name="birthdate"
                    type="date"
                    max={new Date().toISOString().slice(0, 10)}
                    defaultValue={member.birthdate ?? ""}
                  />
                </Field>
                <Field label="Gender" htmlFor="gender">
                  <Select id="gender" name="gender" defaultValue={member.gender ?? ""}>
                    <option value="">—</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="nonbinary">Nonbinary</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </Select>
                </Field>
              </div>
            </FormSection>

            <FormSection title="Golf">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Handicap index" htmlFor="handicapIndex">
                  <Input
                    id="handicapIndex"
                    name="handicapIndex"
                    type="number"
                    step="0.1"
                    defaultValue={member.handicapIndex}
                  />
                </Field>
                <Field label="Year started golf" htmlFor="yearStartedGolf">
                  <Input
                    id="yearStartedGolf"
                    name="yearStartedGolf"
                    type="number"
                    min="1930"
                    defaultValue={member.yearStartedGolf ?? ""}
                  />
                </Field>
              </div>
            </FormSection>

            <FormSection title="Contact">
              <Field label="Email" htmlFor="email">
                <Input id="email" name="email" type="email" required defaultValue={member.email} />
              </Field>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Phone" htmlFor="phone">
                  <Input id="phone" name="phone" defaultValue={member.phone ?? ""} />
                </Field>
                <Field label="Address" htmlFor="address">
                  <Input id="address" name="address" defaultValue={member.address ?? ""} />
                </Field>
              </div>
            </FormSection>

            <FormSection title="Emergency contact">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Name" htmlFor="emergencyContactName">
                  <Input
                    id="emergencyContactName"
                    name="emergencyContactName"
                    defaultValue={member.emergencyContactName ?? ""}
                  />
                </Field>
                <Field label="Phone" htmlFor="emergencyContactPhone">
                  <Input
                    id="emergencyContactPhone"
                    name="emergencyContactPhone"
                    defaultValue={member.emergencyContactPhone ?? ""}
                  />
                </Field>
              </div>
            </FormSection>

            <FormSection title="Membership status">
              <Field label="Active" htmlFor="active">
                <Select id="active" name="active" defaultValue={member.active ? "true" : "false"}>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </Select>
              </Field>
            </FormSection>

            <div className="flex gap-3">
              <Button type="submit">Save changes</Button>
              <Link href="/admin/members" className={cn(buttonVariants({ variant: "ghost" }))}>
                Cancel
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">{title}</legend>
      {children}
    </fieldset>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}
