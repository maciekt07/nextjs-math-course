import { AlertCircle, MailCheck, MailWarning } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import { AuthIconCard } from "../_components/auth-card";

export const metadata = {
  title: "Verify Email Change",
  robots: { index: false, follow: false },
};

export default async function VerifyEmailChangePage({
  searchParams,
}: {
  searchParams: Promise<{ success: string; error: string }>;
}) {
  const isSuccess = (await searchParams).success === "true";
  const tokenExpired = (await searchParams).error === "token_expired";

  return tokenExpired ? (
    <AuthIconCard
      icon={AlertCircle}
      title="Link expired"
      description="Your verification link has expired. Try to change email again."
      variant="destructive"
    >
      <Button asChild className="w-full">
        <Link href="/account">Go to account</Link>
      </Button>
    </AuthIconCard>
  ) : isSuccess ? (
    <AuthIconCard
      title="Email Change Complete"
      description="Your email address has been successfully updated."
      icon={MailCheck}
    >
      <Button className="w-full" asChild>
        <Link href="/">Back to home</Link>
      </Button>
    </AuthIconCard>
  ) : (
    <AuthIconCard
      title="Verify your new email"
      description="We've sent a verification link to your new email address. Open the email and click the link to finish the change."
      icon={MailWarning}
    />
  );
}
