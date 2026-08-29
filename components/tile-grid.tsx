import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const CANDY_BG = {
  red: "bg-candy-red",
  orange: "bg-candy-orange",
  yellow: "bg-candy-yellow",
  green: "bg-candy-green",
  teal: "bg-candy-teal",
  blue: "bg-candy-blue",
  purple: "bg-candy-purple",
  pink: "bg-candy-pink",
} as const;

// Ambient colored glow under each glass pill, keyed to the same palette —
// referencing the CSS custom property directly so it always matches the
// icon badge fill above it.
const CANDY_GLOW = {
  red: "shadow-[0_20px_40px_-14px_rgba(0,0,0,0.7),0_10px_28px_-8px_var(--candy-red),inset_0_1px_0_0_rgba(255,255,255,0.08)]",
  orange:
    "shadow-[0_20px_40px_-14px_rgba(0,0,0,0.7),0_10px_28px_-8px_var(--candy-orange),inset_0_1px_0_0_rgba(255,255,255,0.08)]",
  yellow:
    "shadow-[0_20px_40px_-14px_rgba(0,0,0,0.7),0_10px_28px_-8px_var(--candy-yellow),inset_0_1px_0_0_rgba(255,255,255,0.08)]",
  green:
    "shadow-[0_20px_40px_-14px_rgba(0,0,0,0.7),0_10px_28px_-8px_var(--candy-green),inset_0_1px_0_0_rgba(255,255,255,0.08)]",
  teal: "shadow-[0_20px_40px_-14px_rgba(0,0,0,0.7),0_10px_28px_-8px_var(--candy-teal),inset_0_1px_0_0_rgba(255,255,255,0.08)]",
  blue: "shadow-[0_20px_40px_-14px_rgba(0,0,0,0.7),0_10px_28px_-8px_var(--candy-blue),inset_0_1px_0_0_rgba(255,255,255,0.08)]",
  purple:
    "shadow-[0_20px_40px_-14px_rgba(0,0,0,0.7),0_10px_28px_-8px_var(--candy-purple),inset_0_1px_0_0_rgba(255,255,255,0.08)]",
  pink: "shadow-[0_20px_40px_-14px_rgba(0,0,0,0.7),0_10px_28px_-8px_var(--candy-pink),inset_0_1px_0_0_rgba(255,255,255,0.08)]",
} as const;

export type CandyColor = keyof typeof CANDY_BG;

export interface Tile {
  href: string;
  label: string;
  sublabel?: string;
  icon: LucideIcon;
  color: CandyColor;
  disabled?: boolean;
}

/**
 * 3D glassy black rounded-rectangle pills — the app's primary way to get
 * around once you're signed in. Each pill is dark frosted glass (blur +
 * translucent white overlay + inset highlight) with a small candy-colored
 * icon badge and a matching ambient glow underneath, so the set still reads
 * as color-coded at a glance without the tiles themselves being flat color.
 */
export function TileGrid({ tiles, heading }: { tiles: Tile[]; heading?: string }) {
  return (
    <div className="flex flex-col gap-3">
      {heading && <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">{heading}</h2>}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((tile) => (
          <TileCard key={tile.href + tile.label} tile={tile} />
        ))}
      </div>
    </div>
  );
}

/** Small candy-colored icon badge shared by the nav pills and ContentTile
 * headers, so both use the same visual language. */
export function IconBadge({
  color,
  disabled = false,
  size = "md",
  children,
}: {
  color: CandyColor;
  disabled?: boolean;
  size?: "sm" | "md";
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-xl",
        size === "sm" ? "h-9 w-9" : "h-11 w-11",
        disabled ? "bg-white/10 text-muted" : cn(CANDY_BG[color], "text-tile-foreground"),
      )}
    >
      {children}
    </span>
  );
}

function TileCard({ tile }: { tile: Tile }) {
  const Icon = tile.icon;
  const body = (
    <div
      className={cn(
        "group relative flex items-center gap-3 rounded-2xl border p-4 backdrop-blur-xl transition-all",
        tile.disabled
          ? "border-white/5 bg-white/[0.02] text-muted"
          : cn(
              "border-white/10 bg-white/[0.05] text-foreground",
              CANDY_GLOW[tile.color],
              "hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.08] active:translate-y-0",
            ),
      )}
    >
      <IconBadge color={tile.color} disabled={tile.disabled}>
        <Icon className="h-5 w-5" strokeWidth={2} />
      </IconBadge>
      <div className="flex min-w-0 flex-col text-left">
        <span className="truncate text-sm font-bold leading-tight">{tile.label}</span>
        {tile.sublabel && <span className="truncate text-xs leading-tight text-muted">{tile.sublabel}</span>}
      </div>
    </div>
  );

  if (tile.disabled) return body;

  return (
    <Link href={tile.href} className="rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand">
      {body}
    </Link>
  );
}

/**
 * A dark glass content card — same glass shell, colored icon badge, and
 * ambient glow as the nav pills, but sized to hold real content (a date, a
 * badge, a button) instead of just an icon + label.
 */
export function ContentTile({
  color,
  className,
  children,
}: {
  color: CandyColor;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-5 text-foreground backdrop-blur-xl",
        CANDY_GLOW[color],
        className,
      )}
    >
      {children}
    </div>
  );
}
