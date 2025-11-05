import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function CoursesPageSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-6 flex flex-col gap-6" aria-hidden>
      <Skeleton className="h-8 w-48 rounded" />
      {[...Array(4)].map((_, i) => (
        <Card
          // biome-ignore lint/suspicious/noArrayIndexKey: safe here
          key={i}
          className="p-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4"
        >
          <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
            <Skeleton className="w-full h-full rounded-md" />
          </div>

          <div className="flex-1 min-w-0 space-y-2">
            <Skeleton className="h-6 md:h-8 w-3/4 rounded" />
            <Skeleton className="h-4 w-full max-w-lg rounded" />
            <Skeleton className="h-4 w-5/6 rounded" />
          </div>

          <div className="flex-shrink-0 w-full md:w-36">
            <Skeleton className="h-12 rounded-md w-full" />
          </div>
        </Card>
      ))}
    </div>
  );
}
