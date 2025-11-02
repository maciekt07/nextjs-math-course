import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { AuthFooter } from "../_components/auth-footer";
import { SignUpForm } from "./sign-up-form";

export const metadata = {
  title: "Sign Up | Math Course Online",
  description: "Create your Math Course Online account to start learning.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function SignUpPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session) {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-slate-100 dark:to-slate-950 p-4">
      <div className="w-full max-w-md flex flex-col items-center">
        <div className="text-center mb-8 flex-shrink-0">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-2">
            Create your account
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Join and start learning
          </p>
        </div>

        <Card className="shadow-lg border-slate-200 dark:border-slate-800 w-full flex-shrink-0">
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
              <SignUpForm />
            </div>
            <AuthFooter
              message="Already have an account?"
              linkText="Sign in"
              linkHref="/auth/sign-in"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
