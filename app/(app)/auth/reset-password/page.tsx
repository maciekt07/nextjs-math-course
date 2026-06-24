import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { AnimateIcon } from "@/components/animate-ui/icons/icon";
import { LogIn } from "@/components/animate-ui/icons/log-in";
import { Button } from "@/components/ui/button";
import { getServerSession } from "@/lib/auth/get-session";
import { buildNoIndexMetadata } from "@/lib/seo";
import { AuthCard, AuthIconCard } from "../_components/auth-card";
import { AuthFooter } from "../_components/auth-footer";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata = buildNoIndexMetadata({
  title: "Reset Password",
  description: "Reset your account password.",
});

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const params = await searchParams;
  const token = params.token;

  const invalidToken =
    params.error === "INVALID_TOKEN" ||
    params.error === "token_expired" ||
    !params.token;

  const session = await getServerSession({
    query: {
      disableCookieCache: true,
    },
  });

  if (invalidToken) {
    return (
      <AuthIconCard
        icon={AlertCircle}
        title="Invalid reset link"
        description="This password reset link is invalid or has expired. Please request a new one."
        variant="destructive"
      >
        {session ? (
          <Button asChild className="w-full">
            <Link href="/account">Request new reset link</Link>
          </Button>
        ) : (
          <AnimateIcon animateOnHover className="w-full">
            <Button asChild className="w-full">
              <Link
                href={{
                  pathname: "/auth/sign-in",
                  query: { returnTo: "/account" },
                }}
              >
                <LogIn /> Sign in to continue
              </Link>
            </Button>
          </AnimateIcon>
        )}
      </AuthIconCard>
    );
  }
  return (
    <AuthCard
      title="New Password"
      description="Create a strong password to secure your account"
    >
      <ResetPasswordForm token={token} session={session?.session ?? null} />
      {!session && (
        <AuthFooter
          message="Remember your password?"
          linkText="Back to Sign In"
          linkHref="/auth/sign-in"
        />
      )}
    </AuthCard>
  );
}
