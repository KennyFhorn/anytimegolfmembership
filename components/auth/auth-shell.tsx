import type { ReactNode } from "react";
import Link from "next/link";
import { Flag } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
  wide = false,
}: {
  heading: string;
  sub?: string;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full flex-1 flex-col justify-center gap-6 px-4 py-16",
        wide ? "max-w-lg" : "max-w-sm",
      )}
    >

      <Link href="/" className="flex flex-col items-center gap-2 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-brand-foreground">
          <Flag className="h-6 w-6" />
        </span>
        <span className="font-brand text-3xl tracking-wide">Anytime Golf</span>
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
