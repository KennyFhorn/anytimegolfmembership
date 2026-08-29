import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";
import { getCurrentProfile } from "@/lib/auth";
import { isDemoMode } from "@/lib/data";
import { resolveSignedInTarget } from "@/lib/types";

export default async function SignupPage({ searchParams }: PageProps<"/signup">) {
  if (isDemoMode()) redirect("/login");
  const nextParam = (await searchParams).next;
  const next = typeof nextParam === "string" && nextParam.startsWith("/") ? nextParam : "/dashboard";

  // Same as /login — don't show a signup form to someone already signed in,
  // but only honor `next` if this user actually has access to it (see
  // resolveSignedInTarget's comment for why that matters).
  const profile = await getCurrentProfile();
  if (profile) redirect(resolveSignedInTarget(next, profile.role));

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
