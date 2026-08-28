import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { isDemoMode } from "@/lib/data";

export default function ForgotPasswordPage() {
  if (isDemoMode()) redirect("/login");

  return (
    <AuthShell
      heading="Reset your password"
      sub="We'll email you a link to set a new one."
      footer={
        <Link href="/login" className="text-brand hover:underline">
          Back to sign in
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
