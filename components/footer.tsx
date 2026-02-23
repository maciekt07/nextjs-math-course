import { Calculator, Github } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth/auth";

export default async function Footer() {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <footer className="w-full border-t border-foreground/10 bg-transparent">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-6">
          <div className="md:col-span-4 flex flex-col gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 font-semibold text-base hover:text-primary transition-colors"
            >
              <Calculator className="w-5 h-5 text-primary" />
              <span>Math Course Online</span>
            </Link>
            <p className="text-sm text-foreground/60 max-w-xs">
              Transforming math education <br /> with interactive, engaging
              courses.
            </p>
          </div>

          <div className="md:col-span-8 grid grid-cols-3 gap-6">
            <div className="flex flex-col gap-3">
              <p className="font-medium text-sm text-foreground">Explore</p>
              <nav className="flex flex-col gap-2 text-sm">
                <Link
                  href="/#courses"
                  className="text-foreground/70 hover:text-primary transition-colors"
                >
                  Courses
                </Link>
                <Link
                  href="/#faq"
                  className="text-foreground/70 hover:text-primary transition-colors"
                >
                  FAQ
                </Link>
              </nav>
            </div>

            <div className="flex flex-col gap-3">
              <p className="font-medium text-sm text-foreground">Account</p>
              <nav className="flex flex-col gap-2 text-sm">
                {session?.user ? (
                  <>
                    <Link
                      href="/account"
                      className="text-foreground/70 hover:text-primary transition-colors"
                    >
                      My Account
                    </Link>
                    <Link
                      href="/courses"
                      className="text-foreground/70 hover:text-primary transition-colors"
                    >
                      My Courses
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/sign-in"
                      className="text-foreground/70 hover:text-primary transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/sign-up"
                      className="text-foreground/70 hover:text-primary transition-colors"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </nav>
            </div>

            <div className="flex flex-col gap-3">
              <p className="font-medium text-sm text-foreground">Connect</p>
              <Link
                href="https://github.com/maciekt07/nextjs-math-course"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-foreground/70 hover:text-primary transition-colors w-fit"
              >
                <Github size={18} />
                <span>GitHub</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-foreground/10">
          <p className="text-center text-xs text-foreground/50">
            © {new Date().getFullYear()} Math Course Online. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
