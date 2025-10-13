import { Calculator, LogIn } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { ThemeSelect } from "@/components/theme-select";
import { Button } from "@/components/ui/button";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="w-full py-6 bg-transparent backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <Calculator className="w-6 h-6 text-primary" />
            <span className="text-2xl font-bold">Math Course Online</span>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeSelect />
            <Button asChild variant="outline">
              <Link href="/login" className="flex items-center gap-2 px-4 py-2">
                <LogIn /> Login
              </Link>
            </Button>
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
