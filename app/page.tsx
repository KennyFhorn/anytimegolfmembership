import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { DemoShortcuts } from "@/components/auth/demo-shortcuts";
import { getCurrentProfile, hasCoachAccess } from "@/lib/auth";
import { isDemoMode } from "@/lib/data";

/**
 * The app's front door. Signed-in users go straight to their area; everyone
 * else gets the Anytime Golf League Night sign-in screen.
 */
export default async function Home() {
  const demo = isDemoMode();

  if (!demo) {
    const profile = await getCurrentProfile();
    if (profile) redirect(hasCoachAccess(profile.role) ? "/admin" : "/dashboard");
  }

  return (
    <AuthShell
      heading="Sign in"
      sub={demo ? undefined : "Anytime Golf League Night — Tuesday & Thursday."}
      footer={
        !demo && (
          <div className="flex flex-col gap-1">
            <span>
              New here?{" "}
              <Link href="/signup" className="text-brand hover:underline">
                Create an account
              </Link>
            </span>
            <span>
              <Link href="/forgot-email" className="text-muted hover:text-foreground">
                Forgot which email you used?
              </Link>
            </span>
          </div>
        )
      }
    >
      {demo ? <DemoShortcuts /> : <LoginForm />}
    </AuthShell>
  );
}
