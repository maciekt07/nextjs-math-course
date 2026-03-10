import { Calendar, Mail, MailWarning, User } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AnimateIcon } from "@/components/animate-ui/icons/icon";
import { Send } from "@/components/animate-ui/icons/send";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Session } from "@/lib/auth/auth-client";
import { getServerSession } from "@/lib/auth/get-session";
import { AUTH_LIMITS } from "@/lib/constants/limits";
import ActiveSessions from "./_components/active-sessions";
import { LogOutButton } from "./_components/logout-button";
import { LogoutEverywhereButton } from "./_components/logout-everywhere-button";

function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

const items = [
  {
    icon: User,
    label: "Name",
    getValue: (user: Session) => user.name,
  },
  {
    icon: Mail,
    label: "Email",
    getValue: (user: Session) => user.email,
  },
  {
    icon: Calendar,
    label: "Joined",
    getValue: (user: Session) => formatDate(user.createdAt),
  },
];

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

  if (!session) {
    redirect("/auth/sign-in");
  }

  const user = session.user;

  return (
    <div className="max-w-2xl mx-auto mt-0 sm:mt-16 px-6 pb-8 space-y-6">
      <header className="space-y-2 text-center">
        <h1 className="sm:text-4xl text-3xl font-bold">Your Account</h1>
        <p className="sm:text-lg text-md text-muted-foreground">
          Manage your personal information and settings
        </p>
      </header>

      {!user.emailVerified && (
        <Card>
          <CardHeader>
            <CardTitle className="text-yellow-600 dark:text-yellow-400 flex items-center justify-start gap-2">
              <MailWarning /> Verify your email
            </CardTitle>
            <CardDescription>
              Please verify your email address to unlock all features.
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
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your personal account details.</CardDescription>
        </CardHeader>

        <CardContent className="divide-y">
          {items.map(({ icon: Icon, label, getValue }) => (
            <div
              key={label}
              className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
            >
              <div className="flex items-center gap-3 text-muted-foreground">
                <Icon size={18} />
                <span className="text-sm">{label}</span>
              </div>

              <span className="text-sm font-medium text-right">
                {getValue(user)}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Session Management</CardTitle>
          <CardDescription>
            Manage your account sessions and sign out when needed.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <ActiveSessions currentSession={session.session} />
          <p className="text-xs text-muted-foreground">
            You can have a maximum of {AUTH_LIMITS.maxSessions} active sessions
            at a time to prevent account sharing.
          </p>
          <div className="flex gap-4">
            <LogOutButton />
            <LogoutEverywhereButton />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
