"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Calendar,
  ChevronDown,
  Flag,
  History,
  LayoutDashboard,
  LogOut,
  Trophy,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

const COACH_LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/members", label: "Members" },
  { href: "/admin/leagues", label: "League nights" },
  { href: "/admin/prizes", label: "Prizes" },
  { href: "/admin/seasons", label: "Seasons" },
];

/**
 * The single site-wide nav, mounted once from the root layout so it never
 * remounts (and never changes shape) as you move between pages. What it
 * shows depends only on whether — and as whom — you're signed in.
 */
export function SiteHeader({
  profile,
  isDemoMode,
}: {
  profile: Profile | null;
  isDemoMode: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [coachOpen, setCoachOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setCoachOpen(false);
        setAccountOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const closeMenus = () => {
    setCoachOpen(false);
    setAccountOpen(false);
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
  const isAdmin = profile?.role === "admin";
  const inCoachArea = pathname.startsWith("/admin");

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
      {/* Logo stays put on the far left; primary nav (incl. the Coach console
          dropdown) clusters right next to it, also on the left. Only the
          account menu is pushed to the far right, via ml-auto below. */}
      <div ref={navRef} className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3 sm:gap-6 sm:px-6">
        <Link
          href={profile ? "/dashboard" : "/"}
          title="Anytime Golf — home"
          className="flex shrink-0 items-center gap-2 font-semibold transition-opacity hover:opacity-80"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-candy-green to-candy-teal text-tile-foreground">
            <Flag className="h-4 w-4" />
          </span>
          <span>Anytime Golf</span>
          {isDemoMode && (
            <Badge variant="gold" className="ml-1">
              Demo mode
            </Badge>
          )}
        </Link>

        {profile && (
          <nav className="flex flex-wrap items-center gap-1 text-sm">
            <NavLink href="/dashboard" label="Dashboard" active={isActive("/dashboard")} icon={LayoutDashboard} />
            <NavLink href="/standings" label="Standings" active={isActive("/standings")} icon={Trophy} />
            <NavLink href="/calendar" label="Calendar" active={isActive("/calendar")} icon={Calendar} />
            <NavLink href="/history" label="History" active={isActive("/history")} icon={History} />

            {isAdmin && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setCoachOpen((v) => !v)}
                  aria-expanded={coachOpen}
                  className={cn(
                    "flex items-center gap-1 rounded-md px-3 py-2 transition-colors hover:bg-surface-raised hover:text-foreground",
                    inCoachArea ? "bg-surface-raised text-foreground" : "text-muted",
                  )}
                >
                  <Users className="h-4 w-4" />
                  Coach console
                  <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", coachOpen && "rotate-180")} />
                </button>
                {coachOpen && (
                  <div className="absolute left-0 top-full z-30 mt-1 w-48 overflow-hidden rounded-lg border border-border bg-surface shadow-xl">
                    {COACH_LINKS.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={closeMenus}
                        className={cn(
                          "block px-3 py-2 text-sm transition-colors hover:bg-surface-raised hover:text-foreground",
                          isActive(link.href) ? "bg-surface-raised text-foreground" : "text-muted",
                        )}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </nav>
        )}

        {profile && (
          <div className="relative ml-auto">
            <button
              type="button"
              onClick={() => setAccountOpen((v) => !v)}
              aria-expanded={accountOpen}
              className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 text-muted transition-colors hover:bg-surface-raised hover:text-foreground"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-candy-purple to-candy-pink text-xs font-bold text-tile-foreground">
                {initials(profile.fullName)}
              </span>
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", accountOpen && "rotate-180")} />
            </button>
            {accountOpen && (
              <div className="absolute right-0 top-full z-30 mt-1 w-52 overflow-hidden rounded-lg border border-border bg-surface shadow-xl">
                <div className="border-b border-border px-3 py-2">
                  <p className="truncate text-sm font-medium text-foreground">{profile.fullName}</p>
                  <p className="text-xs capitalize text-muted">{profile.role}</p>
                </div>
                <Link
                  href="/account"
                  onClick={closeMenus}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-surface-raised hover:text-foreground",
                    isActive("/account") ? "bg-surface-raised text-foreground" : "text-muted",
                  )}
                >
                  <User className="h-4 w-4" />
                  Profile settings
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={isDemoMode || signingOut}
                  className="flex w-full items-center gap-2 border-t border-border px-3 py-2 text-left text-sm text-muted transition-colors hover:bg-surface-raised hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <LogOut className="h-4 w-4" />
                  {signingOut ? "Signing out…" : "Sign out"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

function NavLink({
  href,
  label,
  active,
  icon: Icon,
}: {
  href: string;
  label: string;
  active: boolean;
  icon: LucideIcon;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-1.5 rounded-md px-3 py-2 transition-colors hover:bg-surface-raised hover:text-foreground",
        active ? "bg-surface-raised text-foreground" : "text-muted",
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "?";
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
