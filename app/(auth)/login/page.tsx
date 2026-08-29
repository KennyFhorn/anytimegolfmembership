import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { DemoShortcuts } from "@/components/auth/demo-shortcuts";
import { getCurrentProfile, hasCoachAccess } from "@/lib/auth";
import { isDemoMode } from "@/lib/data";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const demo = isDemoMode();
  const nextParam = (await searchParams).next;
  const next = typeof nextParam === "string" && nextParam.startsWith("/") ? nextParam : "/dashboard";

  // Landing here while already signed in (stale bookmark, browser back
  // button, a link from before you signed in) used to render the login
  // form anyway — the navbar showed you as signed in while the page under
  // it still showed a sign-in form. Bounce straight to where you're going.
  if (!demo) {
    const profile = await getCurrentProfile();
    if (profile) redirect(next !== "/dashboard" ? next : hasCoachAccess(profile.role) ? "/admin" : "/dashboard");
  }

  return (
    <AuthShell
      heading="Sign in"
      sub={demo ? undefined : "Welcome back to Anytime Golf League Night."}
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
      {demo ? <DemoShortcuts /> : <LoginForm next={next} />}
    </AuthShell>
  );
}
