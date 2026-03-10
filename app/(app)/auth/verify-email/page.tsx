import { Mail } from "lucide-react";
import type { Metadata } from "next";
import { redirect, unauthorized } from "next/navigation";
import { getServerSession } from "@/lib/auth/get-session";
import { AuthIconCard } from "../_components/auth-card";
import { SendVerificationButton } from "./_components/send-verification-button";

export const dynamic = "force-dynamic";

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
    <AuthIconCard
      icon={Mail}
      title="Verify your email"
      description={
        <>
          We will send a verification link to your email address ({user?.email}
          ). Please check your inbox or{" "}
          <strong className="text-foreground/80">your spam folder</strong> and
          click the link to continue.
        </>
      }
      variant="default"
    >
      <SendVerificationButton email={user?.email || ""} />
    </AuthIconCard>
  );
}
