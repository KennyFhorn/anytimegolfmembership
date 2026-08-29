import { redirect } from "next/navigation";
import { getCurrentProfile, hasCoachAccess } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile || !hasCoachAccess(profile.role)) {
    redirect("/login?next=/admin");
  }

  return <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">{children}</main>;
}
