"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function AccountPageSkeleton() {
  return (
    <div className="max-w-xl mx-auto mt-0 sm:mt-16 px-6 pb-8 space-y-8">
      <header className="space-y-2 text-center">
        <h1 className="sm:text-4xl text-3xl font-bold">Your Account</h1>
        <p className="sm:text-lg text-md text-muted-foreground">
          Manage your personal information and settings
        </p>
      </header>

      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: safe here
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="flex-shrink-0 w-14 h-14 rounded-full" />
            <div className="flex flex-col">
              <Skeleton className="h-3 w-20 mb-2" />
              <Skeleton className="h-6 w-56" />
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2">
        <Skeleton className="h-10 w-full rounded-md mx-auto" />
      </div>
    </div>
  );
}
