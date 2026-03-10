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
import { ResetPasswordForm } from "./reset-password-form";

export const metadata = {
  title: "Reset Password",
  description: "Reset your account password.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : undefined;

  const session = await getServerSession();

  if (session) {
    redirect("/");
  }

  return (
    <>
      <div className="text-center mb-8 flex-shrink-0">
        <h1 className="text-3xl font-bold mb-2">Reset your password</h1>
        <p className="text-muted-foreground">Enter your new password below</p>
      </div>

      <Card className="w-full flex-shrink-0">
        <CardHeader className="space-y-1">
          <div>
            <CardTitle className="text-2xl">New Password</CardTitle>
            <CardDescription className="mt-2">
              Create a strong password to secure your account
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-4">
            <ResetPasswordForm token={token} />
          </div>
          <AuthFooter
            message="Remember your password?"
            linkText="Back to Sign In"
            linkHref="/auth/sign-in"
          />
        </CardContent>
      </Card>
    </>
  );
}
