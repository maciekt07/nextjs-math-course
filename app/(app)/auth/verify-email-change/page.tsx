import { AlertCircle, MailCheck, MailWarning } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { buildNoIndexMetadata } from "@/lib/seo";
import { AuthIconCard } from "../_components/auth-card";

export const metadata: Metadata = buildNoIndexMetadata({
  title: "Verify Email Change",
  description:
    "Confirm your new email address to finish updating your account details.",
});

export default async function VerifyEmailChangePage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const params = await searchParams;
  const isSuccess = params.success === "true";
  const invalidToken =
    params?.error === "INVALID_TOKEN" || params?.error === "token_expired";

  if (invalidToken) {
    return (
      <AuthIconCard
        icon={AlertCircle}
        title="Invalid verification link"
        description="This verification link is invalid or has expired"
        variant="destructive"
      >
        <Button asChild className="w-full">
          <Link href="/account">Go to account</Link>
        </Button>
      </AuthIconCard>
    );
  }

  if (isSuccess) {
    return (
      <AuthIconCard
        icon={MailCheck}
        title="Email Change Complete"
        description="Your email address has been successfully updated."
      >
        <Button className="w-full" asChild>
          <Link href="/">Back to home</Link>
        </Button>
      </AuthIconCard>
    );
  }

  return (
    <AuthIconCard
      icon={MailWarning}
      title="Verify your new email"
      description="We've sent a verification link to your new email address. Open the email and click the link to finish the change."
    />
  );
}
