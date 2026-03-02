import { Calendar, Mail, MailWarning, User } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AnimateIcon } from "@/components/animate-ui/icons/icon";
import { Send } from "@/components/animate-ui/icons/send";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Session } from "@/lib/auth/auth-client";
import { getServerSession } from "@/lib/auth/get-session";
import { LogOutButton } from "./_components/logout-button";

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
    bg: "bg-blue-100/70 dark:bg-blue-800/30",
    text: "text-blue-600 dark:text-blue-400",
  },
  {
    icon: Mail,
    label: "Email",
    getValue: (user: Session) => user.email,
    bg: "bg-green-100/70 dark:bg-green-800/30",
    text: "text-green-600 dark:text-green-400",
  },
  {
    icon: Calendar,
    label: "Joined",
    getValue: (user: Session) => formatDate(user.createdAt),
    bg: "bg-purple-100/70 dark:bg-purple-800/30",
    text: "text-purple-600 dark:text-purple-400",
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
  const session = await getServerSession();

  if (!session) {
    redirect("/auth/sign-in");
  }

  const user = session.user;

  return (
    <div className="max-w-xl mx-auto mt-0 sm:mt-16 px-6 pb-8 space-y-8">
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

      {/* Account info */}
      <div className="space-y-6">
        {items.map(({ icon: Icon, label, getValue, bg, text }) => (
          <div key={label} className="flex items-center gap-4">
            <div
              className={`flex-shrink-0 w-14 h-14 flex items-center justify-center rounded-full ${bg}`}
            >
              <Icon className={text} size={28} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">{label}</span>
              <span className="text-lg font-medium">{getValue(user)}</span>
            </div>
          </div>
        ))}
      </div>

      <LogOutButton />
    </div>
  );
}
