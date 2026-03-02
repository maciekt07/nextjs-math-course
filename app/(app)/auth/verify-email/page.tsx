import { AlertCircle, Mail } from "lucide-react";
import type { Metadata } from "next";
import { redirect, unauthorized } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getServerSession } from "@/lib/auth/get-session";
import { SendVerificationButton } from "./_components/send-verification-button";

export const metadata: Metadata = {
  title: "Verify your email",
  description: "Check your inbox to verify your email before logging in.",
  robots: { index: false, follow: false },
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  const session = await getServerSession();
  const user = session?.user;

  if (!user) unauthorized();

  if (user?.emailVerified) {
    redirect("/");
  }

  const tokenExpired = searchParams?.error === "token_expired";

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-3 text-center">
        <div className="bg-primary/10 p-6 rounded-full mx-auto">
          <Mail className="h-12 w-12 text-primary" />
        </div>
        <CardTitle className="text-2xl">Verify your email</CardTitle>
        {tokenExpired && (
          <Card className="w-full p-3 text-left rounded-md border border-red-500 bg-red-50 dark:bg-red-900/30 dark:border-red-400 shadow-sm">
            <CardContent className="flex items-center gap-3 px-1">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                Verification link expired. Please request a new email.
              </p>
            </CardContent>
          </Card>
        )}
        <CardDescription>
          We will send a verification link to your email address ({user?.email}
          ). Please check your inbox or{" "}
          <strong className="text-foreground/80">your spam folder</strong> and
          click the link to continue.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0 flex flex-col items-center space-y-4 w-full">
        <SendVerificationButton email={user?.email || ""} />
      </CardContent>
    </Card>
  );
}
