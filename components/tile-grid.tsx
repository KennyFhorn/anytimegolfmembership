import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const CANDY_COLORS = {
  red: "bg-candy-red",
  orange: "bg-candy-orange",
  yellow: "bg-candy-yellow",
  green: "bg-candy-green",
  teal: "bg-candy-teal",
  blue: "bg-candy-blue",
  purple: "bg-candy-purple",
  pink: "bg-candy-pink",
} as const;

export type CandyColor = keyof typeof CANDY_COLORS;

export interface Tile {
  href: string;
  label: string;
  sublabel?: string;
  icon: LucideIcon;
  color: CandyColor;
  disabled?: boolean;
}

/**
 * A jar-of-candy grid of big square nav tiles — the app's primary way to get
 * around once you're signed in. Each tile is its own punchy candy color so
 * the whole grid pops at a glance; text and icons are always a dark,
 * high-contrast color on top — never white-on-color and never a dark/black
 * tile (including the disabled state).
 */
export function TileGrid({ tiles, heading }: { tiles: Tile[]; heading?: string }) {
  return (
    <div className="flex flex-col gap-3">
      {heading && <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">{heading}</h2>}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {tiles.map((tile) => (
          <TileCard key={tile.href + tile.label} tile={tile} />
        ))}
      </div>
    </div>
  );
}

/** A small candy-colored icon badge, for accenting an otherwise plain card
 * header with the same palette the tile grid uses. */
export function IconChip({ color, children }: { color: CandyColor; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-lg text-tile-foreground",
        CANDY_COLORS[color],
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
        "group relative flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl p-3 text-center shadow-lg transition-all",
        tile.disabled
          ? "cursor-not-allowed bg-tile-disabled text-tile-disabled-foreground"
          : cn(
              CANDY_COLORS[tile.color],
              "text-tile-foreground hover:scale-[1.04] hover:shadow-2xl active:scale-[0.98]",
            ),
      )}
    >
      <Icon className="h-8 w-8 sm:h-10 sm:w-10" strokeWidth={2} />
      <span className="text-sm font-bold leading-tight sm:text-base">{tile.label}</span>
      {tile.sublabel && <span className="text-xs leading-tight opacity-80">{tile.sublabel}</span>}
    </div>
  );

  if (tile.disabled) return body;

  return (
    <Link href={tile.href} className="rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground">
      {body}
    </Link>
  );
}
