import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { isDemoMode } from "@/lib/data";

export default function ResetPasswordPage() {
  if (isDemoMode()) redirect("/login");

  return (
    <AuthShell heading="Set a new password" sub="Choose a new password for your account.">
      <ResetPasswordForm />
    </AuthShell>
  );
}
