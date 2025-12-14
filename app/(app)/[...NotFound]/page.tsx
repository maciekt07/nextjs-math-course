import { ChevronLeft } from "lucide-react";
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
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
      <h1 className="text-5xl font-extrabold my-4">404</h1>
      <p className="text-lg mb-2 text-foreground/80">
        Oops! The page does not exist.
      </p>
      <p className="mb-6 text-foreground/60">
        It might have been removed or you typed the URL incorrectly.
      </p>
      <Button asChild size="lg">
        <Link href="/" className="inline-flex items-center gap-2">
          <ChevronLeft /> Go Back Home
        </Link>
      </Button>
    </div>
  );
}
