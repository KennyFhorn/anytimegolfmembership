"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { recoverEmail, type RecoverEmailResult } from "@/app/(auth)/forgot-email/actions";

export function ForgotEmailForm() {
  const [state, formAction, pending] = useActionState<RecoverEmailResult | null, FormData>(
    recoverEmail,
    null,
  );

  if (state?.ok) {
    return (
      <div className="flex flex-col gap-2 text-sm">
        <p className="text-muted">The email on your account is:</p>
        <p className="rounded-md border border-border bg-surface-raised px-3 py-2 font-medium">
          {state.email}
        </p>
        <a href="/login" className="text-brand hover:underline">
          Back to sign in
        </a>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <p className="text-sm text-muted">
        Enter your last name and at least one of phone or address. If they match a single account,
        we&apos;ll show you its email.
      </p>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="lastName">Last name</Label>
        <Input id="lastName" name="lastName" required placeholder="Mitchell" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" type="tel" placeholder="(555) 123-4567" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="address">Address</Label>
        <Input id="address" name="address" placeholder="123 Fairway Dr, Springfield" />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Checking…" : "Find my email"}
      </Button>
      {state && !state.ok && <p className="text-sm text-red-400">{state.message}</p>}
    </form>
  );
}
