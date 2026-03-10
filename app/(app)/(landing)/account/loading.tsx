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

export default function AccountPageSkeleton() {
  return (
    <div className="max-w-2xl mx-auto mt-0 sm:mt-16 px-6 pb-8 space-y-6">
      <header className="space-y-2 text-center">
        <h1 className="sm:text-4xl text-3xl font-bold">Your Account</h1>
        <p className="sm:text-lg text-md text-muted-foreground">
          Manage your personal information and settings
        </p>
      </header>
      <Card className="pb-6">
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-5 w-40 rounded-md" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-3 w-54 rounded-md" />
          </CardDescription>
        </CardHeader>

        <CardContent className="mt-1.5 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-2 first:pt-0 last:pb-0"
            >
              <Skeleton className="h-5 w-16 rounded-md" />
              <Skeleton className="h-5 w-36 rounded-md" />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-5 w-40 rounded-md" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-3 w-96 rounded-md" />
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div aria-hidden className="h-[71px] rounded-lg" />
          <div aria-hidden className="h-[71px] rounded-lg" />
          <div>
            <Skeleton className="h-4 w-64 rounded-md" />
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-8.5 w-26 rounded-md" />
            <Skeleton className="h-8.5 w-46 rounded-md" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
