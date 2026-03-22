/** biome-ignore-all lint/suspicious/noArrayIndexKey: skeleton */
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto mt-0 max-w-2xl space-y-6 px-4 pb-8 sm:mt-16">
      <header className="space-y-2 text-center">
        <h1 className="sm:text-4xl text-3xl font-bold">Your Account</h1>
        <p className="sm:text-lg text-md text-muted-foreground">
          Manage your personal information and settings
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Skeleton className="size-5 rounded-full" />
            <Skeleton className="h-5 w-44 rounded-md" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-48 rounded-md" />
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="order-2 flex min-w-0 flex-1 items-center gap-4 md:order-1">
              <Skeleton className="size-12 shrink-0 rounded-full mt-1" />

              <div className="min-w-0 flex-1 space-y-2 mt-3">
                <Skeleton className="h-4 w-36 rounded-md" />
                <Skeleton className="h-3 w-52 rounded-md" />
                <Skeleton className="h-3 w-40 rounded-md" />
              </div>
            </div>

            <Skeleton className="order-1 h-6.5 w-31 border rounded-full md:order-2 md:self-start" />
          </div>

          <div className="h-px bg-border" />

          <div className="space-y-2 pb-0.5">
            <Skeleton className="h-4 w-16 rounded-md" />
            <div className="flex gap-2 -mt-0.5">
              <Skeleton className="h-9 flex-1 rounded-md border-1" />
              <Skeleton className="h-9 w-[82px] shrink-0 rounded-md border-1" />
            </div>
            <Skeleton className="h-3.5 w-56 rounded-md" />
          </div>

          <div className="h-px bg-border" />

          <div className="space-y-2">
            <Skeleton className="h-4 w-28 rounded-md" />
            <Skeleton className="h-5 w-44 rounded-md mt-2 mb-2" />
            <Skeleton className="h-4 w-48 rounded-md mt-2.5" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Skeleton className="size-5 rounded-full" />
            <Skeleton className="h-5 w-40 rounded-md" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-56 rounded-md" />
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Skeleton className="h-[72px] rounded-lg border mt-1" />
          <div className="flex justify-center flex-col gap-1">
            <Skeleton className="h-3.5 w-full sm:w-[80%] rounded-md" />
            <Skeleton className="h-3.5 sm:hidden w-[24%] rounded-md" />
          </div>
          <div className="h-px bg-border sm:mt-4.5" />
          <div className="flex gap-4">
            <Skeleton className="h-9 w-25.5 rounded-md" />
            <Skeleton className="h-9 w-46 rounded-md" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Skeleton className="size-5 rounded-full" />
            <Skeleton className="h-5 w-32 rounded-md" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-52 rounded-md" />
          </CardDescription>
        </CardHeader>

        <CardContent className="mt-1.5">
          <div className="space-y-7 py-2">
            {[...Array(3)].map((_, i) => (
              <div key={i}>
                {/* ROW */}
                <div className="flex items-start justify-between gap-6">
                  {/* LEFT */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-6">
                      <Skeleton className="h-5 w-40 rounded-md mb-1" />
                      {/* SWITCH */}
                      <Skeleton className="h-[22px] w-[34px] rounded-full" />
                    </div>

                    {/* description */}
                    <div className="mt-1">
                      <Skeleton className="h-4 w-72 rounded-md" />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* FONT STYLE */}
            <div>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-5 w-28 rounded-md mb-2" />
                  <Skeleton className="h-4 w-64 rounded-md" />
                </div>

                <Skeleton className="h-10 w-[180px] rounded-md" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
