import { AlertCircle, Check } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { AnimateIcon } from "@/components/animate-ui/icons/icon";
import { LogIn } from "@/components/animate-ui/icons/log-in";
import { Button } from "@/components/ui/button";
import { getServerSession } from "@/lib/auth/get-session";
import { AuthIconCard } from "../_components/auth-card";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Email Verified",
  robots: { index: false, follow: false },
};

export default async function EmailVerifiedPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const tokenExpired = params?.error === "token_expired";

  const session = await getServerSession({
    query: { disableCookieCache: true },
  });
  const user = session?.user;

  if (tokenExpired) {
    return (
      <AuthIconCard
        icon={AlertCircle}
        title="Link expired"
        description="Your verification link has expired. Please request a new one."
        variant="destructive"
      >
        {user ? (
          <Button asChild className="w-full">
            <Link href="/auth/verify-email">Request new link</Link>
          </Button>
        ) : (
          <AnimateIcon animateOnHover className="w-full">
            <Button asChild className="w-full">
              <Link
                href={{
                  pathname: "/auth/sign-in",
                  query: { returnTo: "/auth/verify-email" },
                }}
              >
                <LogIn /> Sign in
              </Link>
            </Button>
          </AnimateIcon>
        )}
      </AuthIconCard>
    );
  }

  return (
    <AuthIconCard
      icon={Check}
      title="Email verified"
      description="Your email has been verified successfully. You can now continue to the app."
      variant="default"
    >
      {user ? (
        <Button asChild className="w-full">
          <Link href="/">Go to home</Link>
        </Button>
      ) : (
        <AnimateIcon animateOnHover className="w-full">
          <Button asChild className="w-full">
            <Link href="/auth/sign-in">
              <LogIn /> Sign in
            </Link>
          </Button>
        </AnimateIcon>
      )}
    </AuthIconCard>
  );
}
