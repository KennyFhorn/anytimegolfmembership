import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { DemoShortcuts } from "@/components/auth/demo-shortcuts";
import { isDemoMode } from "@/lib/data";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const demo = isDemoMode();
  const nextParam = (await searchParams).next;
  const next = typeof nextParam === "string" && nextParam.startsWith("/") ? nextParam : "/dashboard";

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
