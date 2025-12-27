import { BookX, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Course Not Found",
  description: "Oops! The course you are looking for doesn't exist.",
  robots: "noindex",
};

export default function NotFoundPage() {
  return (
    <div className="flex h-dvh w-full items-center justify-center">
      <EmptyState
        icon={BookX}
        title="The course does not exist."
        description="It might have been removed or you typed the URL incorrectly."
        action={
          <Button asChild size="xl">
            <Link href="/">
              <ChevronLeft />
              Go Back Home
            </Link>
          </Button>
        }
      />
    </div>
  );
}
