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
import { SignUpForm } from "./sign-up-form";

export const metadata = {
  title: "Sign Up",
  description: "Create your Math Course Online account to start learning.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function SignUpPage({
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
        <h1 className="text-3xl font-bold mb-2">Create your account</h1>
        <p className="text-muted-foreground">Join and start learning</p>
      </div>

      <Card className="w-full flex-shrink-0">
        <CardHeader className="space-y-1">
          <div>
            <CardTitle className="text-2xl">Sign Up</CardTitle>
            <CardDescription className="mt-2">
              Create an account to track your progress
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-4">
            <SignUpForm returnTo={returnTo} />
          </div>
          <AuthFooter
            message="Already have an account?"
            linkText="Sign in"
            linkHref="/auth/sign-in"
            returnTo={returnTo}
          />
        </CardContent>
      </Card>
    </>
  );
}
