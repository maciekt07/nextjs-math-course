import { getServerSession } from "@/lib/auth/get-session";
import { buildNoIndexMetadata } from "@/lib/seo";
import { AuthCard } from "../_components/auth-card";
import { AuthFooter } from "../_components/auth-footer";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata = buildNoIndexMetadata({
  title: "Reset Password",
  description: "Reset your account password.",
});

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : undefined;

  const session = await getServerSession({
    query: {
      disableCookieCache: true,
    },
  });

  return (
    <AuthCard
      title="New Password"
      description="Create a strong password to secure your account"
    >
      <ResetPasswordForm token={token} session={session?.session ?? null} />
      {!session && (
        <AuthFooter
          message="Remember your password?"
          linkText="Back to Sign In"
          linkHref="/auth/sign-in"
        />
      )}
    </AuthCard>
  );
}
