import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { getRepository } from "@/lib/data";
import { getCurrentProfile } from "@/lib/auth";
import { updateOwnProfileAction } from "./actions";

export default async function AccountPage() {
  const repo = await getRepository();
  const profile = await getCurrentProfile();
  const me = profile ? await repo.getMemberByProfileId(profile.id) : null;

  if (!profile || !me) {
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

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile settings</h1>
        <p className="text-muted">Keep your contact and emergency info up to date.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <div>
            <CardTitle>Account</CardTitle>
            <CardDescription>{me.email}</CardDescription>
          </div>
          <div className="flex flex-col items-end gap-1 text-sm text-muted">
            <span>Handicap index: <span className="font-medium text-foreground">{me.handicapIndex.toFixed(1)}</span></span>
            <Badge variant={me.active ? "success" : "default"}>{me.active ? "Active" : "Inactive"}</Badge>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your details</CardTitle>
          <CardDescription>
            Email, handicap, and membership status are managed by Coach Ryan — everything else is yours to update.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateOwnProfileAction} className="flex flex-col gap-5">
            <FormSection title="Name">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="First name" htmlFor="firstName">
                  <Input id="firstName" name="firstName" required defaultValue={me.firstName ?? ""} />
                </Field>
                <Field label="Last name" htmlFor="lastName">
                  <Input id="lastName" name="lastName" required defaultValue={me.lastName ?? ""} />
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
                    defaultValue={me.birthdate ?? ""}
                  />
                </Field>
                <Field label="Gender" htmlFor="gender">
                  <Select id="gender" name="gender" defaultValue={me.gender ?? ""}>
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
              <Field label="Year started golf" htmlFor="yearStartedGolf">
                <Input
                  id="yearStartedGolf"
                  name="yearStartedGolf"
                  type="number"
                  min="1930"
                  defaultValue={me.yearStartedGolf ?? ""}
                />
              </Field>
            </FormSection>

            <FormSection title="Contact">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Phone" htmlFor="phone">
                  <Input id="phone" name="phone" defaultValue={me.phone ?? ""} />
                </Field>
                <Field label="Address" htmlFor="address">
                  <Input id="address" name="address" defaultValue={me.address ?? ""} />
                </Field>
              </div>
            </FormSection>

            <FormSection title="Emergency contact">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Name" htmlFor="emergencyContactName">
                  <Input
                    id="emergencyContactName"
                    name="emergencyContactName"
                    defaultValue={me.emergencyContactName ?? ""}
                  />
                </Field>
                <Field label="Phone" htmlFor="emergencyContactPhone">
                  <Input
                    id="emergencyContactPhone"
                    name="emergencyContactPhone"
                    defaultValue={me.emergencyContactPhone ?? ""}
                  />
                </Field>
              </div>
            </FormSection>

            <Button type="submit" className="w-fit">
              Save changes
            </Button>
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
