"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";

const CURRENT_YEAR = new Date().getFullYear();

function ageFromBirthdate(birthdate: string): number | null {
  if (!birthdate) return null;
  const dob = new Date(birthdate);
  if (Number.isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age -= 1;
  return age >= 0 && age < 130 ? age : null;
}

export function SignupForm({ next = "/dashboard" }: { next?: string }) {
  // Name
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  // Personal
  const [birthdate, setBirthdate] = useState("");
  const [gender, setGender] = useState("");
  // Golf
  const [handicapIndex, setHandicapIndex] = useState("18");
  const [yearStartedGolf, setYearStartedGolf] = useState("");
  // Contact
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  // Emergency contact
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");
  // Account
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const age = useMemo(() => ageFromBirthdate(birthdate), [birthdate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Use a password of at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setBusy(true);
    try {
      const supabase = createClient();
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            phone: phone.trim(),
            address: address.trim(),
            birthdate: birthdate || null,
            gender: gender || null,
            handicap_index: handicapIndex ? Number(handicapIndex) : null,
            year_started_golf: yearStartedGolf ? Number(yearStartedGolf) : null,
            emergency_contact_name: emergencyContactName.trim(),
            emergency_contact_phone: emergencyContactPhone.trim(),
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (error) throw error;
      if (data.session) {
        // Full navigation, not router.push — see the note in login-form.tsx.
        window.location.assign(next);
      } else {
        setSent(true);
      }
    } catch (err) {
      setBusy(false);
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (sent) {
    return (
      <p className="text-sm text-foreground">
        Almost there — check <span className="font-medium">{email}</span> for a confirmation link,
        then come back and sign in.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <FormSection title="Your name">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="First name" htmlFor="firstName">
            <Input
              id="firstName"
              autoComplete="given-name"
              required
              placeholder="Jordan"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </Field>
          <Field label="Last name" htmlFor="lastName">
            <Input
              id="lastName"
              autoComplete="family-name"
              required
              placeholder="Mitchell"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection title="Personal">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label={`Birthdate${age !== null ? ` — age ${age}` : ""}`} htmlFor="birthdate">
            <Input
              id="birthdate"
              type="date"
              autoComplete="bday"
              required
              max={new Date().toISOString().slice(0, 10)}
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
            />
          </Field>
          <Field label="Gender" htmlFor="gender">
            <Select id="gender" value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="">Optional</option>
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
          <Field label="Starting handicap" htmlFor="handicapIndex">
            <Input
              id="handicapIndex"
              type="number"
              step="0.1"
              min="0"
              max="54"
              placeholder="18.0"
              value={handicapIndex}
              onChange={(e) => setHandicapIndex(e.target.value)}
            />
          </Field>
          <Field label="Year you first played" htmlFor="yearStartedGolf">
            <Input
              id="yearStartedGolf"
              type="number"
              min="1930"
              max={CURRENT_YEAR}
              placeholder="2015"
              value={yearStartedGolf}
              onChange={(e) => setYearStartedGolf(e.target.value)}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection title="Contact">
        <Field label="Email" htmlFor="email">
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Phone" htmlFor="phone">
            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              required
              placeholder="(555) 123-4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </Field>
          <Field label="Address" htmlFor="address">
            <Input
              id="address"
              autoComplete="street-address"
              placeholder="123 Fairway Dr"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection title="Emergency contact">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Name" htmlFor="emergencyContactName">
            <Input
              id="emergencyContactName"
              required
              placeholder="Full name"
              value={emergencyContactName}
              onChange={(e) => setEmergencyContactName(e.target.value)}
            />
          </Field>
          <Field label="Phone" htmlFor="emergencyContactPhone">
            <Input
              id="emergencyContactPhone"
              type="tel"
              required
              placeholder="(555) 987-6543"
              value={emergencyContactPhone}
              onChange={(e) => setEmergencyContactPhone(e.target.value)}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection title="Account">
        <Field label="Password" htmlFor="password">
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        <Field label="Confirm password" htmlFor="confirm">
          <Input
            id="confirm"
            type="password"
            autoComplete="new-password"
            required
            placeholder="Re-enter your password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </Field>
      </FormSection>

      <Button type="submit" disabled={busy} className="mt-1">
        {busy ? "Creating account…" : "Create account"}
      </Button>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </form>
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
