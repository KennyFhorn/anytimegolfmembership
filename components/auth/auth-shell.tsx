import type { ReactNode } from "react";
import Link from "next/link";
import { Flag } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Centered, branded wrapper for every account screen (sign in, sign up,
 * password reset, email recovery). Keeps the login experience visually
 * consistent with the rest of the dark Tailwind theme.
 */
export function AuthShell({
  heading,
  sub,
  children,
  footer,
}: {
  heading: string;
  sub?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-4 py-16">
      <Link href="/" className="flex flex-col items-center gap-2 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-brand-foreground">
          <Flag className="h-6 w-6" />
        </span>
        <span className="text-lg font-semibold tracking-tight">Anytime Golf</span>
        <span className="text-xs uppercase tracking-[0.2em] text-muted">League Night</span>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>{heading}</CardTitle>
          {sub && <CardDescription>{sub}</CardDescription>}
        </CardHeader>
        <CardContent className="flex flex-col gap-4">{children}</CardContent>
      </Card>

      {footer && <div className="text-center text-sm text-muted">{footer}</div>}
    </div>
  );
}
