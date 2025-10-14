import { LogIn, Mail } from "lucide-react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Verify your email | Math Course",
  description: "Check your inbox to verify your email before logging in.",
  robots: { index: false },
  openGraph: {
    title: "Verify your email",
    description: "Check your inbox to verify your email before logging in.",
  },
};

export default async function VerifyEmailPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session?.user.emailVerified) {
    redirect("/courses");
  }

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
      <div className="rounded-2xl border p-8 shadow-sm max-w-md w-full bg-card">
        <div className="flex flex-col items-center space-y-5">
          <div className="bg-primary/10 p-4 rounded-full">
            <Mail className="h-8 w-8 text-primary" />
          </div>

          <h1 className="text-2xl font-semibold tracking-tight">
            Verify your email {session?.user.email}
          </h1>

          <p className="text-muted-foreground text-sm">
            We've sent a verification link to your email address. Please check
            your inbox and click the link to continue.
          </p>

          <Button asChild variant="outline" size="lg" className="mt-4">
            <Link href="/auth/login">
              <LogIn />
              Go to Login
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
