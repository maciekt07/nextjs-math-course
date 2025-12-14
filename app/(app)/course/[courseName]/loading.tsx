/** biome-ignore-all lint/suspicious/noArrayIndexKey: safe here */

import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <article className="mx-auto pb-8 mt-10 px-6 max-w-4xl">
      {/* lesson title */}
      <div className="mb-8 font-inter">
        <Skeleton className="h-[2.5rem] w-3/4 mb-4 rounded-lg" />
        <div className="flex items-center gap-1.5 h-5">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-6 w-24" />
          <Separator orientation="vertical" className="self-stretch mx-2" />
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-6 w-20" />

          <Separator orientation="vertical" className="self-stretch mx-2" />
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>

      <Separator className="mb-6" />

      {/* TOC for small screens */}
      <div className="hidden max-[1704px]:block my-8">
        <Skeleton className="bg-card rounded-2xl px-6 border-1">
          <div className="flex items-center justify-between py-4">
            <Skeleton className="h-5 w-28 rounded-md" />
            <Skeleton className="h-5 w-5 rounded" />
          </div>
        </Skeleton>
      </div>

      {/* TOC for large screens */}
      <div className="hidden min-[1704px]:block fixed right-4 top-24 w-64 max-h-[70vh] overflow-auto border-l pl-6">
        <Skeleton className="h-4 w-26 mb-4 rounded-md" />
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <Skeleton className="mt-1 h-2 w-2 rounded-full flex-shrink-0" />
            <Skeleton className="h-[18px] w-full rounded-md" />
          </div>
          <div className="flex items-start gap-2">
            <Skeleton className="mt-1 h-2 w-2 rounded-full flex-shrink-0" />
            <Skeleton className="h-[18px] w-full rounded-md" />
          </div>
          <div className="flex items-start gap-2 pl-4">
            <Skeleton className="mt-1 h-2 w-2 rounded-full flex-shrink-0" />
            <Skeleton className="h-[18px] w-full rounded-md" />
          </div>
          <div className="flex items-start gap-2">
            <Skeleton className="mt-1 h-2 w-2 rounded-full flex-shrink-0" />
            <Skeleton className="h-[18px] w-full rounded-md" />
          </div>
          <div className="flex items-start gap-2 pl-4">
            <Skeleton className="mt-1 h-2 w-2 rounded-full flex-shrink-0" />
            <Skeleton className="h-[18px] w-full rounded-md" />
          </div>
          <div className="flex items-start gap-2">
            <Skeleton className="mt-1 h-2 w-2 rounded-full flex-shrink-0" />
            <Skeleton className="h-[18px] w-full rounded-md" />
          </div>
        </div>
      </div>

      {/* example content */}
      <div className="space-y-6 mt-6">
        {/* p */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-full rounded-md" />
          <Skeleton className="h-5 w-full rounded-md" />
          <Skeleton className="h-5 w-[95%] rounded-md" />
          <Skeleton className="h-5 w-full rounded-md" />
          <Skeleton className="h-5 w-[88%] rounded-md" />
        </div>

        <Separator />

        {/* h2 */}
        <Skeleton className="h-8 w-[60%] rounded-md" />

        {/* p */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-full rounded-md" />
          <Skeleton className="h-5 w-full rounded-md" />
          <Skeleton className="h-5 w-[92%] rounded-md" />
        </div>

        <Skeleton className="h-32 w-full rounded-lg" />

        {/* h3 */}
        <Skeleton className="h-7 w-[45%] rounded-md" />

        {/* p */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-full rounded-md" />
          <Skeleton className="h-5 w-full rounded-md" />
          <Skeleton className="h-5 w-full rounded-md" />
          <Skeleton className="h-5 w-[85%] rounded-md" />
        </div>

        <div className="space-y-2 pl-4">
          <Skeleton className="h-5 w-[90%] rounded-md" />
          <Skeleton className="h-5 w-[85%] rounded-md" />
          <Skeleton className="h-5 w-[88%] rounded-md" />
        </div>

        {/* img */}
        <Skeleton className="h-56 w-full rounded-lg" />

        {/* p */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-full rounded-md" />
          <Skeleton className="h-5 w-full rounded-md" />
          <Skeleton className="h-5 w-[78%] rounded-md" />
        </div>
      </div>
    </article>
  );
}
