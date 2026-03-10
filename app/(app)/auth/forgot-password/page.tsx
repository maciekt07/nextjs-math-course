import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/get-session";
import { AuthCard } from "../_components/auth-card";
import { AuthFooter } from "../_components/auth-footer";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata = {
  title: "Forgot Password",
  description: "Reset your password by entering your email address.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ForgotPasswordPage({
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
      title="Reset Password"
      description="Enter your email address to receive a password reset link"
    >
      <ForgotPasswordForm />
      <AuthFooter
        message="Remember your password?"
        linkText="Back to Sign In"
        linkHref="/auth/sign-in"
        returnTo={returnTo}
      />
    </AuthCard>
  );
}
