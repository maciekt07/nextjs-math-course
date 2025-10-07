import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 px-6 text-center">
      <h1 className="text-5xl font-bold text-gray-900 mb-4">404</h1>
      <p className="text-lg text-gray-700 mb-2">
        Oops! The page does not exist.
      </p>
      <p className="text-gray-500 mb-6">
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
