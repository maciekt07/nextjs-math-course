import { Calendar, Mail, User } from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import type { Session } from "@/lib/auth/auth-client";
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
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return {
      title: "Your Account",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `Your Account (${session.user.name})`,
    description: `Manage your account, email, and course settings for ${session.user.name}.`,
    robots: { index: true, follow: true },
  };
}

export default async function AccountPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/sign-in");
  }

  return (
    <div className="max-w-xl mx-auto mt-16 px-6 space-y-8">
      <header className="space-y-2 text-center">
        <h1 className="text-4xl font-bold">Your Account</h1>
        <p className="text-lg text-muted-foreground">
          Manage your personal information and settings
        </p>
      </header>
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
              <span className="text-lg font-medium">
                {getValue(session.user)}
              </span>
            </div>
          </div>
        ))}
      </div>
      <LogOutButton />
    </div>
  );
}
