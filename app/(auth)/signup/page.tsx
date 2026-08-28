import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";
import { isDemoMode } from "@/lib/data";

export default async function SignupPage({ searchParams }: PageProps<"/signup">) {
  if (isDemoMode()) redirect("/login");
  const nextParam = (await searchParams).next;
  const next = typeof nextParam === "string" && nextParam.startsWith("/") ? nextParam : "/dashboard";

  return (
    <AuthShell
      heading="Create your account"
      sub="Register for Anytime Golf League Night."
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
