"use client";

import Link from "next/link";
import { useMounted } from "@/hooks/use-mounted";
import { authClient } from "@/lib/auth/auth-client";

const linkClassName = "text-foreground/70 hover:text-primary transition-colors";

export function FooterAccountLinks() {
  const mounted = useMounted();
  const { data: session } = authClient.useSession();

  if (mounted && session?.user) {
    return (
      <>
        <Link href="/account" className={linkClassName}>
          My Account
        </Link>
        <Link href="/courses" className={linkClassName}>
          My Courses
        </Link>
      </>
    );
  }

  return (
    <>
      <Link href="/auth/sign-in" className={linkClassName}>
        Sign In
      </Link>
      <Link href="/auth/sign-up" className={linkClassName}>
        Sign Up
      </Link>
    </>
  );
}
