import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/get-session";
import { APP_NAME, buildNoIndexMetadata } from "@/lib/seo";
import { AuthCard } from "../_components/auth-card";
import { AuthFooter } from "../_components/auth-footer";

import { SignInForm } from "./sign-in-form";

export const metadata = buildNoIndexMetadata({
  title: "Sign In",
  description: `Access your ${APP_NAME} account to continue learning and manage your courses.`,
});

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const params = await searchParams;
  const returnTo = params.returnTo;

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
