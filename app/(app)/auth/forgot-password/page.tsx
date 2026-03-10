import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getServerSession } from "@/lib/auth/get-session";
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

  const session = await getServerSession();

  if (session) {
    redirect("/");
  }

  return (
    <>
      <div className="text-center mb-8 flex-shrink-0">
        <h1 className="text-3xl font-bold mb-2">Reset your password</h1>
        <p className="text-muted-foreground">
          Enter your email and we'll send you a link to reset it
        </p>
      </div>

      <Card className="w-full flex-shrink-0">
        <CardHeader className="space-y-1">
          <div>
            <CardTitle className="text-2xl">Forgot Password</CardTitle>
            <CardDescription className="mt-2">
              Enter your email address to receive a password reset link
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-4">
            <ForgotPasswordForm />
          </div>
          <AuthFooter
            message="Remember your password?"
            linkText="Back to Sign In"
            linkHref="/auth/sign-in"
            returnTo={returnTo}
          />
        </CardContent>
      </Card>
    </>
  );
}
