import { LogIn, Mail } from "lucide-react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth/auth";

export const metadata: Metadata = {
  title: "Verify your email",
  description: "Check your inbox to verify your email before logging in.",
  robots: { index: false, follow: false },
};

export default async function VerifyEmailPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session?.user.emailVerified) {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border p-8 shadow-sm bg-card">
          <div className="flex flex-col items-center space-y-5 text-center">
            <div className="bg-primary/10 p-6 rounded-full">
              <Mail className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Verify your email
            </h1>
            <p className="text-sm text-muted-foreground max-w-xs">
              We've sent a verification link to your email address. Please check
              your inbox and click the link to continue.
            </p>
            <Button asChild variant="outline" size="lg" className="mt-4">
              <Link href="/auth/sign-in" className="flex items-center gap-2">
                <LogIn />
                Go to Login
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
