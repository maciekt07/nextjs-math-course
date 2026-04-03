import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/get-session";
import { buildNoIndexMetadata } from "@/lib/seo";
import { AuthCard } from "../_components/auth-card";
import { AuthFooter } from "../_components/auth-footer";
import { SignUpForm } from "./sign-up-form";

export const metadata = buildNoIndexMetadata({
  title: "Sign Up",
  description: "Create your Math Course Online account to start learning.",
});

export default async function SignUpPage({
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
      title="Sign Up"
      description="Create an account and start learning"
    >
      <SignUpForm returnTo={returnTo} />
      <AuthFooter
        message="Already have an account?"
        linkText="Sign in"
        linkHref="/auth/sign-in"
        returnTo={returnTo}
      />
    </AuthCard>
  );
}
