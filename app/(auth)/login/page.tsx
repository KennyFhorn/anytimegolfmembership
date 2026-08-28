import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { LoginForm } from "@/components/login-form";
import { isDemoMode } from "@/lib/data";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const demo = isDemoMode();

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            {demo
              ? "Demo mode is active — no Supabase project is connected yet, so there's nothing to sign into."
              : "We'll email you a magic link, no password needed."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {demo ? (
            <div className="flex flex-col gap-2">
              <Link href="/dashboard" className={cn(buttonVariants({ variant: "primary" }))}>
                Continue to demo dashboard
              </Link>
              <Link href="/admin" className={cn(buttonVariants({ variant: "secondary" }))}>
                Continue to demo admin console
              </Link>
            </div>
          ) : (
            <LoginForm />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
