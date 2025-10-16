import { BookOpen } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CoursesPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 space-y-4">
      <div className="p-6 rounded-full bg-gray-200 dark:bg-gray-800">
        <BookOpen size={48} className="text-gray-600 dark:text-gray-300" />
      </div>
      <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
        No courses yet
      </h2>
      <p className="text-gray-600 dark:text-gray-400">
        Check out our offer and start learning today!
      </p>
      <Button asChild size="lg" className="mt-2">
        <Link href="/">Browse Courses</Link>
      </Button>
    </div>
  );
}
