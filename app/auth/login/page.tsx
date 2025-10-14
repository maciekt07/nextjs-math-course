import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ThemeSelect } from "@/components/theme-select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { auth } from "@/lib/auth";
import { SignInTab } from "./_components/sign-in-tab";
import { SignUpTab } from "./_components/sign-up-tab";

//TODO: add separate routes for sign in and sign up
export default async function LoginPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session) {
    redirect("/courses");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-slate-100 dark:to-slate-950 p-4">
      <div className="absolute top-4 right-4">
        <ThemeSelect />
      </div>
      <div className="w-full max-w-md flex flex-col items-center">
        <div className="text-center mb-8 flex-shrink-0">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-2">
            Welcome
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Sign in to your account or create a new one
          </p>
        </div>
        <Card className="shadow-lg border-slate-200 dark:border-slate-800 w-full flex-shrink-0">
          <Tabs defaultValue="signin" className="w-full">
            <CardHeader className="space-y-1 pb-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin" className="text-sm">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" className="text-sm">
                  Sign Up
                </TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent className="pt-0 min-h-[360px]">
              <TabsContent value="signin" className="space-y-4">
                <div>
                  <CardTitle className="text-2xl">Sign In</CardTitle>
                  <CardDescription className="mt-2">
                    Enter your credentials to access your account
                  </CardDescription>
                </div>
                <SignInTab />
              </TabsContent>
              <TabsContent value="signup" className="space-y-4">
                <div>
                  <CardTitle className="text-2xl">Create Account</CardTitle>
                  <CardDescription className="mt-2">
                    Fill in your information to get started
                  </CardDescription>
                </div>
                <SignUpTab />
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
