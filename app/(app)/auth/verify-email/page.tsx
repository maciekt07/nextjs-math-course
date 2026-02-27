import { Mail } from "lucide-react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
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
import { auth } from "@/lib/auth/auth";

export const metadata: Metadata = {
  title: "Verify your email",
  description: "Check your inbox to verify your email before logging in.",
  robots: { index: false, follow: false },
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const returnTo =
    typeof params.returnTo === "string" ? params.returnTo : undefined;

  const session = await auth.api.getSession({ headers: await headers() });

  if (session?.user.emailVerified) {
    redirect("/");
  }

  const loginHref = returnTo
    ? `/auth/sign-in?returnTo=${encodeURIComponent(returnTo)}`
    : "/auth/sign-in";

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-5 text-center">
        <div className="bg-primary/10 p-6 rounded-full mx-auto">
          <Mail className="h-12 w-12 text-primary" />
        </div>
        <CardTitle className="text-2xl">Verify your email</CardTitle>
        <CardDescription>
          We've sent a verification link to your email address. Please check
          your inbox and click the link to continue.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0 flex flex-col items-center space-y-4">
        <AnimateIcon animateOnHover>
          <Button asChild variant="outline" size="lg">
            <Link href={loginHref} className="flex items-center gap-2">
              <LogIn />
              Go to Login
            </Link>
          </Button>
        </AnimateIcon>
      </CardContent>
    </Card>
  );
}
