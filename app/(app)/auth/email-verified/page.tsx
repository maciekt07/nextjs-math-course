"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth/auth-client";

export default function EmailVerifiedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  useEffect(() => {
    if (error === "token_expired") {
      router.replace(`/auth/verify-email?error=${error}`);
      return;
    }

    authClient
      .getSession({ query: { disableCookieCache: true } })
      .then(() => router.refresh())
      .catch((err) => console.error("Failed to refresh session:", err));
  }, [router, error]);

  if (error) return null;

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
        <Button asChild className="w-full">
          <Link href="/">Go to home</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
