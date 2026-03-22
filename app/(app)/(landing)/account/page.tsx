import {
  CircleUser,
  ClockFading,
  LockKeyhole,
  Mail,
  MailWarning,
  SettingsIcon,
} from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AnimateIcon } from "@/components/animate-ui/icons/icon";
import { Send } from "@/components/animate-ui/icons/send";
import { Settings } from "@/components/settings";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { auth } from "@/lib/auth/auth";
import { getServerSession } from "@/lib/auth/get-session";
import { AUTH_LIMITS } from "@/lib/constants/limits";
import ActiveSessions from "./_components/active-sessions";
import { LogOutButton } from "./_components/logout-button";
import { LogoutEverywhereButton } from "./_components/logout-everywhere-button";
import { PasswordChangeButton } from "./_components/password-change-button";
import { RequestEmailChangeButton } from "./_components/request-email-change-button";
import { UpdateNameForm } from "./_components/update-name-form";

export async function generateMetadata() {
  const session = await getServerSession();

  if (!session) {
    return {
      title: "Your Account",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `Your Account (${session.user.name})`,
  };
}

export default async function AccountPage() {
  const session = await getServerSession({
    query: {
      disableCookieCache: true,
    },
  });

  const accounts = await auth.api.listUserAccounts({
    headers: await headers(),
  });

  const isGoogle = accounts.some((acc) => acc.providerId === "google");
  const isCredentials = accounts.some((acc) => acc.providerId === "credential");

  if (!session) {
    redirect("/auth/sign-in");
  }

  const user = session.user;

  return (
    <div className="max-w-2xl mx-auto mt-0 sm:mt-16 px-4 pb-8 space-y-6">
      <header className="space-y-2 text-center">
        <h1 className="sm:text-4xl text-3xl font-bold">Your Account</h1>
        <p className="sm:text-lg text-md text-muted-foreground">
          Manage your personal information and settings
        </p>
      </header>

      {!user.emailVerified && isCredentials && (
        <Card className="border-yellow-600/50 dark:border-yellow-400/50">
          <CardHeader>
            <CardTitle className="text-yellow-600 dark:text-yellow-400 flex items-center justify-start gap-2 text-lg">
              <MailWarning className="size-6" /> Verify your email
            </CardTitle>
            <CardDescription>
              Please verify your email address to be able to purchase a course.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <AnimateIcon animateOnHover className="w-full">
              <Button className="w-full cursor-pointer" asChild>
                <Link href="/auth/verify-email">
                  <Send /> Send verification email
                </Link>
              </Button>
            </AnimateIcon>
          </CardFooter>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CircleUser className="size-5" />
            Account Information
          </CardTitle>
          <CardDescription>
            Manage your personal account details.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0 order-2 md:order-1">
              <Avatar className="size-12">
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-semibold">
                  {session.user.name?.charAt(0).toUpperCase() ||
                    session.user.email?.charAt(0).toUpperCase() ||
                    "U"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{user.name}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {user.email}
                </p>
                {isGoogle && (
                  <p className="text-sm text-muted-foreground truncate">
                    Signed in with Google
                  </p>
                )}
              </div>
            </div>

            <Badge
              variant="outline"
              className="text-xs text-muted-foreground px-3 py-1 order-1 md:order-2 self-start"
            >
              Joined{" "}
              {new Intl.DateTimeFormat("en-US", {
                month: "short",
                year: "numeric",
              }).format(new Date(user.createdAt))}
            </Badge>
          </div>

          <Separator />

          <UpdateNameForm name={user.name} />

          <Separator />

          {/* Email */}
          <div className="space-y-2">
            <Label>Email address</Label>

            <div className="flex items-center justify-start gap-2">
              <p className="text-md font-bold flex items-center gap-2">
                <Mail className="size-[15px] shrink-0 text-muted-foreground" />
                {user.email}
              </p>

              {user.emailVerified ? (
                <Badge variant="success" className="gap-1">
                  Verified
                </Badge>
              ) : (
                <Badge variant="destructive" className="gap-1">
                  Unverified
                </Badge>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              Used for login and notifications.
            </p>
          </div>
          {isCredentials && (
            <RequestEmailChangeButton
              currentEmail={user.email}
              isVerified={user.emailVerified}
            />
          )}
        </CardContent>
      </Card>

      {isCredentials && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-start gap-2">
              <LockKeyhole className="size-5" /> Password
            </CardTitle>
            <CardDescription>
              Request a password change. We will send a confirmation email to
              your account.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <PasswordChangeButton
              email={session.user.email}
              isVerified={session.user.emailVerified}
            />
          </CardFooter>
        </Card>
      )}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-start gap-2">
            <ClockFading className="size-5" /> Session Management
          </CardTitle>
          <CardDescription>
            Manage your account sessions and sign out when needed.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <Suspense
            fallback={
              <div className="flex flex-col gap-2">
                <Skeleton className="h-[72px] rounded-lg border" />
              </div>
            }
          >
            <ActiveSessions />
          </Suspense>
          <p className="text-xs text-muted-foreground">
            You can have a maximum of{" "}
            <span className="font-semibold text-foreground/80">
              {AUTH_LIMITS.maxSessions}
            </span>{" "}
            active sessions at a time to prevent account sharing.
          </p>
          <Separator />
          <div className="flex gap-4">
            <LogOutButton />
            <LogoutEverywhereButton />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-start gap-2">
            <SettingsIcon className="size-5" /> Course settings
          </CardTitle>
          <CardDescription>
            Manage your course view preferences.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Settings />
        </CardContent>
      </Card>
    </div>
  );
}
