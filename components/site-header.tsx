import Link from "next/link";
import { Flag } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function SiteHeader({
  links,
  isDemoMode,
  homeHref = "/dashboard",
}: {
  links: { href: string; label: string }[];
  isDemoMode: boolean;
  homeHref?: string;
}) {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href={homeHref} className="flex items-center gap-2 font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-brand-foreground">
            <Flag className="h-4 w-4" />
          </span>
          <span>Anytime Golf</span>
          {isDemoMode && (
            <Badge variant="gold" className="ml-1">
              Demo mode
            </Badge>
          )}
        </Link>
        <nav className="flex flex-wrap items-center gap-1 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-muted transition-colors hover:bg-surface-raised hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
