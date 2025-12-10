"use client";

import type { User } from "better-auth";
import { BookOpen, Calculator, LogIn, Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ThemeSelect } from "@/components/theme-select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export function Navbar({ user }: { user: User | null }) {
  const [open, setOpen] = useState<boolean>(false);
  const [atTop, setAtTop] = useState<boolean>(true);

  useEffect(() => {
    const handleScroll = () => setAtTop(window.scrollY < 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="mb-24">
      <header
        className={cn(
          "w-full py-5 bg-transparent fixed backdrop-blur-3xl z-10 transition-all duration-300",
          atTop ? "border-b border-transparent" : "border-b",
        )}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <Calculator className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold">Math Course Online</span>
          </Link>

          <div className="hidden md:flex items-center gap-3">
            <ThemeSelect />
            {user ? (
              <>
                <Button asChild variant="outline">
                  <Link href="/courses">
                    <BookOpen /> My Courses
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/account" className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user.name?.charAt(0).toUpperCase() ||
                          user.email?.charAt(0).toUpperCase() ||
                          "U"}
                      </AvatarFallback>
                    </Avatar>
                    {user.name}
                  </Link>
                </Button>
              </>
            ) : (
              <Button asChild variant="outline">
                <Link href="/auth/sign-in" className="flex items-center gap-2">
                  <LogIn /> Log In
                </Link>
              </Button>
            )}
          </div>

          <div className="md:hidden flex items-center gap-2">
            <ThemeSelect />
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Menu">
                  {open ? <X /> : <Menu />}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="p-6 space-y-4">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-primary" />
                    Math Course Online
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-3">
                  {user ? (
                    <>
                      <Button
                        asChild
                        variant="outline"
                        onClick={() => setOpen(false)}
                      >
                        <Link href="/courses">
                          <BookOpen /> My Courses
                        </Link>
                      </Button>
                      <Button
                        asChild
                        variant="outline"
                        onClick={() => setOpen(false)}
                      >
                        <Link
                          href="/account"
                          className="flex items-center gap-2"
                        >
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {user.name?.charAt(0).toUpperCase() ||
                                user.email?.charAt(0).toUpperCase() ||
                                "U"}
                            </AvatarFallback>
                          </Avatar>
                          {user.name}
                        </Link>
                      </Button>
                    </>
                  ) : (
                    <Button
                      asChild
                      variant="outline"
                      onClick={() => setOpen(false)}
                    >
                      <Link
                        href="/auth/sign-in"
                        className="flex items-center gap-2"
                      >
                        <LogIn /> Log In
                      </Link>
                    </Button>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </div>
  );
}
