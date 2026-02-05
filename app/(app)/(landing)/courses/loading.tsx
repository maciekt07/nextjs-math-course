/** biome-ignore-all lint/suspicious/noArrayIndexKey: safe here */

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function CoursesPageSkeleton() {
  return (
    <div className="max-w-4xl mx-auto pt-0 p-6 flex flex-col gap-6" aria-hidden>
      <h1 className="text-3xl font-bold">Your Courses</h1>
      {[...Array(2)].map((_, i) => (
        <Card
          key={i}
          className="group relative flex flex-col py-4 md:py-6 rounded-3xl overflow-hidden"
        >
          <div className="px-4 md:px-6 relative">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="relative w-full h-48 sm:w-32 sm:h-32 rounded-lg overflow-hidden flex-shrink-0">
                <Skeleton className="w-full h-full" />
              </div>

              <div className="flex-1 min-w-0 relative space-y-2 w-full">
                <Skeleton className="h-7 md:h-8 w-3/4 rounded" />
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-5/6 rounded" />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 flex-1 -mt-3 px-4 md:px-6 relative">
            <Skeleton className="h-6 w-32 my-1 rounded" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </Card>
      ))}
    </div>
  );
}
