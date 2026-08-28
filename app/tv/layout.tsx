import Link from "next/link";

const TABS = [
  { href: "/tv/leaderboard", label: "Leaderboard" },
  { href: "/tv/groups", label: "Groups" },
  { href: "/tv/standings", label: "Standings" },
];

export default function TvLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="tv-surface flex min-h-screen flex-col text-white">
      <main className="flex-1 px-10 py-8 sm:px-16 sm:py-10">{children}</main>
      <nav className="flex justify-center gap-2 pb-4 opacity-30 hover:opacity-100">
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="rounded-full border border-white/20 px-4 py-1 text-xs uppercase tracking-widest text-white/70 hover:bg-white/10"
          >
            {tab.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
