import { ChevronLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Page Not Found",
  description: "Oops! The page you are looking for doesn't exist.",
  robots: "noindex",
};

// catch-all page as a workaround for route groups because not-found.tsx inside a route group doesn't trigger

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-8 text-center">
      <h1
        className="
    text-7xl sm:text-8xl font-black tracking-tight
    bg-gradient-to-b from-primary to-primary/60
    bg-clip-text text-transparent
    drop-shadow-[0_4px_20px_hsl(var(--primary)/0.25)]
  "
      >
        404
      </h1>

      <div className="relative w-full max-w-lg h-48 sm:h-64 my-6 opacity-90">
        <Image
          src="/not-found.svg"
          alt="Not Found Illustration"
          fill
          className="object-contain"
          unoptimized
          priority
        />
        <div className="absolute bottom-0 left-0 w-full h-14 sm:h-18 bg-gradient-to-t from-background" />
      </div>

      <p className="text-xl mb-2 font-medium text-foreground/80">
        Oops! The page does not exist.
      </p>
      <p className="mb-6 text-foreground/60">
        It might have been removed or you typed the URL incorrectly.
      </p>

      <Button asChild size="xl">
        <Link href="/">
          <ChevronLeft /> Go Back Home
        </Link>
      </Button>
    </div>
  );
}
