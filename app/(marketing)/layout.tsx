import { BookOpen, Calculator, LogIn } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import type { ReactNode } from "react";
import { ThemeSelect } from "@/components/theme-select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";

export default async function MarketingLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  return (
    <div className="flex flex-col min-h-screen">
      <header className="w-full py-6 bg-transparent backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <Calculator className="w-6 h-6 text-primary" />
            <span className="text-2xl font-bold">Math Course Online</span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeSelect />
            {session?.user ? (
              <>
                <Button asChild variant="outline">
                  <Link href="/courses">
                    <BookOpen /> My Courses
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/account">
                    <Avatar className="w-6 h-6 text-primary">
                      <AvatarFallback>
                        {getInitials(session.user.name)}
                      </AvatarFallback>
                    </Avatar>
                    {session.user.name}
                  </Link>
                </Button>
              </>
            ) : (
              <Button asChild variant="outline">
                <Link
                  href="/auth/login"
                  className="flex items-center gap-2 px-4 py-2"
                >
                  <LogIn /> Log In
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1 w-full py-4">{children}</main>
      <footer className="w-full py-6 bg-transparent border-t border-foreground/10">
        <div className="max-w-7xl mx-auto text-center text-sm text-foreground/70">
          &copy; Math Course Online. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
