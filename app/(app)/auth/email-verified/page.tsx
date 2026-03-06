import { AlertCircle, Check } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { AnimateIcon } from "@/components/animate-ui/icons/icon";
import { LogIn } from "@/components/animate-ui/icons/log-in";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getServerSession } from "@/lib/auth/get-session";

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
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-3 text-center">
          <div className="bg-destructive/10 p-6 rounded-full mx-auto">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Link expired</CardTitle>
          <CardDescription>
            Your verification link has expired. Please request a new one.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 flex flex-col items-center w-full">
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
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-3 text-center">
        <div className="bg-primary/10 p-6 rounded-full mx-auto">
          <Check className="h-12 w-12 text-primary" />
        </div>
        <CardTitle className="text-2xl">Email verified</CardTitle>
        <CardDescription>
          Your email has been verified successfully. You can now continue to the
          app.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0 flex flex-col items-center space-y-4 w-full">
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
      </CardContent>
    </Card>
  );
}
