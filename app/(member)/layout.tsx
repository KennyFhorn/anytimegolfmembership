import { SiteHeader } from "@/components/site-header";
import { isDemoMode } from "@/lib/data";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/standings", label: "Standings" },
  { href: "/admin", label: "Coach console" },
];

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader links={LINKS} isDemoMode={isDemoMode()} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
