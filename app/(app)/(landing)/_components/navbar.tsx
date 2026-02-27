"use client";

import type { User } from "better-auth";
import { BookOpen, Calculator, LogIn, Menu, UserPlus, X } from "lucide-react";
import {
  AnimatePresence,
  type HTMLMotionProps,
  motion,
  useReducedMotion,
} from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ThemeSelect } from "@/components/theme-select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useMounted } from "@/hooks/use-mounted";
import { cn } from "@/lib/ui";

export const navLinks = [
  { label: "Courses", href: "/#courses" },
  { label: "FAQ", href: "/#faq" },
] as const satisfies readonly { label: string; href: string }[];

interface AuthButtonsProps extends React.ComponentProps<"button"> {
  user: User | null;
  onNavigate?: () => void;
}

function AuthButtons({
  user,
  onNavigate,
  className,
  ...props
}: AuthButtonsProps) {
  if (user) {
    return (
      <>
        <Button
          asChild
          variant="outline"
          className={cn("backdrop-blur-md", className)}
          onClick={onNavigate}
          {...props}
        >
          <Link href="/courses">
            <BookOpen /> My Courses
          </Link>
        </Button>

        <Button
          asChild
          variant="outline"
          className={cn("backdrop-blur-md", className)}
          onClick={onNavigate}
          {...props}
        >
          <Link href="/account" className="flex items-center gap-2">
            <Avatar className="size-6">
              <AvatarFallback className="bg-primary text-primary-foreground text-sm!">
                {user.name?.charAt(0).toUpperCase() ||
                  user.email?.charAt(0).toUpperCase() ||
                  "U"}
              </AvatarFallback>
            </Avatar>
            {user.name}
          </Link>
        </Button>
      </>
    );
  }

  return (
    <>
      <Button
        asChild
        variant="outline"
        className="backdrop-blur-md"
        onClick={onNavigate}
      >
        <Link href="/auth/sign-in">
          <LogIn /> Log In
        </Link>
      </Button>

      <Button asChild onClick={onNavigate}>
        <Link href="/auth/sign-up">
          <UserPlus /> Sign Up
        </Link>
      </Button>
    </>
  );
}

export function Navbar({ user }: { user: User | null }) {
  const [open, setOpen] = useState<boolean>(false);
  const [atTop, setAtTop] = useState<boolean>(true);
  const prefersReducedMotion = useReducedMotion();
  const mounted = useMounted();

  useEffect(() => {
    const handleScroll = () => setAtTop(window.scrollY < 10);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  const showBorder = !atTop || open;

  const iconMotionProps: HTMLMotionProps<"div"> = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0.5, scale: 0.8, filter: "blur(4px)" },
        animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
        exit: { opacity: 0.5, scale: 0.8, filter: "blur(4px)" },
        transition: { duration: 0.14 },
      };

  const backdropMotionProps: HTMLMotionProps<"div"> = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.2 },
      };

  const menuMotionProps: HTMLMotionProps<"div"> = prefersReducedMotion
    ? {}
    : {
        initial: { y: -10, opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: -10, opacity: 0 },
        transition: { duration: 0.2 },
      };

  return (
    <div className="mb-24">
      <header
        suppressHydrationWarning
        className={cn(
          "w-full py-4 sm:py-5 fixed z-50 border-b bg-background/30 backdrop-blur-2xl transition-colors duration-250 motion-reduce:transition-none motion-reduce:duration-0",
          !showBorder && "border-transparent bg-transparent backdrop-blur-none",
          open && "bg-background",
        )}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4">
          {/* LEFT */}
          <div className="flex items-center gap-6 ml-1">
            <Link
              href="/"
              className="flex items-center gap-3"
              onClick={() => setOpen(false)}
            >
              <Calculator className="size-6 text-primary" />
              <span className="text-xl font-bold">Math Course Online</span>
            </Link>

            <div className="hidden md:flex items-center ml-2 gap-5 font-medium text-muted-foreground">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* DESKTOP RIGHT */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeSelect />
            <AuthButtons user={user} />
          </div>

          <div className="md:hidden flex items-center sm:gap-2 gap-3">
            <ThemeSelect />
            <Button
              variant="outline"
              size="icon"
              className="cursor-pointer backdrop-blur-md overflow-hidden"
              onClick={() => setOpen((v) => !v)}
            >
              {!mounted ? (
                /* SSR */
                <Menu />
              ) : (
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={open ? "close" : "menu"}
                    {...iconMotionProps}
                  >
                    {open ? <X /> : <Menu />}
                  </motion.div>
                </AnimatePresence>
              )}
            </Button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <>
            {/* BACKDROP */}
            <motion.div
              onClick={() => setOpen(false)}
              className="fixed inset-x-0 bottom-0 top-16 sm:top-18 z-30 bg-black/30 backdrop-blur-xs"
              {...backdropMotionProps}
            />
            <motion.div
              className="fixed left-0 right-0 top-16 sm:top-18 z-40 border-b bg-background p-6 space-y-4"
              {...menuMotionProps}
            >
              <nav className="flex flex-col gap-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    className="text-lg font-medium"
                    href={link.href}
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}

                <div className="border-t pt-6 mt-2 flex flex-col gap-4">
                  <AuthButtons
                    user={user}
                    onNavigate={() => setOpen(false)}
                    className="p-5 text-base"
                  />
                </div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
