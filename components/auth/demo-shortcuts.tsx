import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Shown on the login screen when no Supabase project is connected. */
export function DemoShortcuts() {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted">
        Demo mode is active — no Supabase project is connected, so there&apos;s no real sign-in.
        Jump straight into the sample data:
      </p>
      <Link href="/dashboard" className={cn(buttonVariants({ variant: "primary" }))}>
        Continue to demo dashboard
      </Link>
      <Link href="/admin" className={cn(buttonVariants({ variant: "secondary" }))}>
        Continue to demo admin console
      </Link>
    </div>
  );
}
