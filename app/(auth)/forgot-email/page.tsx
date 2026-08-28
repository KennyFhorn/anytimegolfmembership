import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotEmailForm } from "@/components/auth/forgot-email-form";
import { isDemoMode } from "@/lib/data";

export default function ForgotEmailPage() {
  if (isDemoMode()) redirect("/login");

  return (
    <AuthShell
      heading="Find your email"
      sub="Forgot which email you registered with?"
      footer={
        <Link href="/login" className="text-brand hover:underline">
          Back to sign in
        </Link>
      }
    >
      <ForgotEmailForm />
    </AuthShell>
  );
}
