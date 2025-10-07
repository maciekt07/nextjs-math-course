import { ReactNode } from "react";
import { Calculator, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen font-sans bg-slate-50">
      <header className="w-full py-6 bg-transparent backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <Calculator className="w-6 h-6 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">
              Math Course Online
            </span>
          </Link>
          <Button asChild variant="outline">
            <Link href="/login" className="flex items-center gap-2 px-4 py-2">
              <LogIn /> Login
            </Link>
          </Button>
        </div>
      </header>
      <main className="flex-1 w-full">{children}</main>
      <footer className="w-full py-6 bg-transparent border-t border-gray-300">
        <div className="max-w-7xl mx-auto text-center text-sm text-gray-500">
          &copy; Math Course Online. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
