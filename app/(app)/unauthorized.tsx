"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimateIcon } from "@/components/animate-ui/icons/icon";
import { LogIn } from "@/components/animate-ui/icons/log-in";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  const pathname = usePathname();

  return (
    <main className="flex h-screen w-screen items-center justify-center px-4">
      <div className="max-w-sm w-full text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">401 - Unauthorized</h1>
          <p className="text-muted-foreground">
            You need to sign in to access this page.
          </p>
        </div>
        <AnimateIcon animateOnHover>
          <Button asChild className="w-full justify-center gap-2">
            <Link href={`/auth/sign-in?returnTo=${pathname}`}>
              <LogIn /> Sign in
            </Link>
          </Button>
        </AnimateIcon>
      </div>
    </main>
  );
}
