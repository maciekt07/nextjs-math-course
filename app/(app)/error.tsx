"use client";
import { AlertCircle, ChevronLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 w-24 h-24 flex items-center justify-center bg-destructive/10 rounded-full">
          <AlertCircle size={48} className="text-destructive" />
        </div>
        <h1 className="text-3xl font-semibold mb-2">Something went wrong</h1>
        <p className="text-muted-foreground mb-6">
          We encountered an unexpected error. Please try again.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 w-full max-w-[250px] mx-auto mt-6">
          <Button onClick={reset} size="lg" className="w-full cursor-pointer">
            <RefreshCw size={18} />
            Try Again
          </Button>

          <Button variant="outline" size="lg" asChild className="w-full">
            <Link href="/">
              <ChevronLeft size={18} />
              Back to home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
