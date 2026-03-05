import { Mail } from "lucide-react";
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

export default async function VerifyEmailPage() {
  const session = await getServerSession({
    query: {
      disableCookieCache: true,
    },
  });
  const user = session?.user;

  if (!user) unauthorized();

  if (user.emailVerified) {
    redirect("/");
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-3 text-center">
        <div className="bg-primary/10 p-6 rounded-full mx-auto">
          <Mail className="h-12 w-12 text-primary" />
        </div>
        <CardTitle className="text-2xl">Verify your email</CardTitle>
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
