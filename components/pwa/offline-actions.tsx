"use client";

import { Home, RotateCw } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function OfflineActions() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Button
        size="lg"
        className="cursor-pointer"
        onClick={() => window.location.reload()}
      >
        <RotateCw /> Try again
      </Button>
      <Button asChild variant="outline" size="lg">
        <Link href="/" prefetch={false}>
          <Home /> Back home
        </Link>
      </Button>
    </div>
  );
}
