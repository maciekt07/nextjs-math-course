import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/get-session";
import { AuthCard } from "../_components/auth-card";
import { AuthFooter } from "../_components/auth-footer";

import { SignInForm } from "./sign-in-form";

export const metadata = {
  title: "Sign In",
  description:
    "Access your Math Course Online account to continue learning and manage your courses.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const returnTo =
    typeof params.returnTo === "string" ? params.returnTo : undefined;

  const session = await getServerSession({
    query: {
      disableCookieCache: true,
    },
  });

  if (session) {
    redirect("/");
  }

  return (
    <AuthCard
      title="Sign In"
      description="Enter your credentials to access your account"
    >
      <SignInForm returnTo={returnTo} />
      <AuthFooter
        message="Don't have an account?"
        linkText="Sign up"
        linkHref="/auth/sign-up"
        returnTo={returnTo}
      />
    </AuthCard>
  );
}
