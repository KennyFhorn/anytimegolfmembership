import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { getCurrentProfile } from "@/lib/auth";
import { isDemoMode } from "@/lib/data";

const LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/members", label: "Members" },
  { href: "/admin/leagues", label: "League nights" },
  { href: "/admin/prizes", label: "Prizes" },
  { href: "/admin/seasons", label: "Seasons" },
  { href: "/dashboard", label: "Member view" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") {
    redirect("/login?next=/admin");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader links={LINKS} isDemoMode={isDemoMode()} homeHref="/admin" />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
