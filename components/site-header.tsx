"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function SiteHeader({
  links,
  isDemoMode,
  homeHref = "/",
}: {
  links: { href: string; label: string }[];
  isDemoMode: boolean;
  homeHref?: string;
}) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link
          href={homeHref}
          title="Anytime Golf — home"
          className="flex items-center gap-2 font-semibold transition-opacity hover:opacity-80"
        >
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
              aria-current={isActive(link.href) ? "page" : undefined}
              className={cn(
                "rounded-md px-3 py-2 transition-colors hover:bg-surface-raised hover:text-foreground",
                isActive(link.href) ? "bg-surface-raised text-foreground" : "text-muted",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
