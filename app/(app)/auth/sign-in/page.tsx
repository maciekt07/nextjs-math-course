import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth/auth";
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

  const session = await auth.api.getSession({ headers: await headers() });

  if (session) {
    redirect("/");
  }

  return (
    <>
      <div className="text-center mb-8 flex-shrink-0">
        <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
        <p className="text-muted-foreground">Sign in to your account</p>
      </div>

      <Card className="w-full flex-shrink-0">
        <CardHeader className="space-y-1">
          <div>
            <CardTitle className="text-2xl">Sign In</CardTitle>
            <CardDescription className="mt-2">
              Enter your credentials to access your account
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-4">
            <SignInForm returnTo={returnTo} />
          </div>
          <AuthFooter
            message="Don't have an account?"
            linkText="Sign up"
            linkHref="/auth/sign-up"
            returnTo={returnTo}
          />
        </CardContent>
      </Card>
    </>
  );
}
