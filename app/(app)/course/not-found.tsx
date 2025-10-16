import { BookX, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Course Not Found",
  description: "Oops! The course you are looking for doesn't exist.",
  robots: "noindex",
};

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
      <BookX size={64} className="text-primary mb-4" />
      <p className="text-lg mb-2 text-foreground/80">
        Oops! The course does not exist.
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
