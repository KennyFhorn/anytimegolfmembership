import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";
import { getCurrentProfile, hasCoachAccess } from "@/lib/auth";
import { isDemoMode } from "@/lib/data";

export default async function SignupPage({ searchParams }: PageProps<"/signup">) {
  if (isDemoMode()) redirect("/login");
  const nextParam = (await searchParams).next;
  const next = typeof nextParam === "string" && nextParam.startsWith("/") ? nextParam : "/dashboard";

  // Same as /login — don't show a signup form to someone already signed in.
  const profile = await getCurrentProfile();
  if (profile) redirect(next !== "/dashboard" ? next : hasCoachAccess(profile.role) ? "/admin" : "/dashboard");

  return (
    <AuthShell
      heading="Create your account"
      sub="Register for Anytime Golf League Night."
      wide
      footer={
        <span>
          Already have an account?{" "}
          <Link href="/login" className="text-brand hover:underline">
            Sign in
          </Link>
        </span>
      }
    >
      <SignupForm next={next} />
    </AuthShell>
  );
}
