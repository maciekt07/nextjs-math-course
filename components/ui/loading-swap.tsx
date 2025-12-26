import type { ReactNode } from "react";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/ui";

export function LoadingSwap({
  isLoading,
  children,
  className,
}: {
  isLoading: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="grid grid-cols-1 items-center justify-items-center relative">
      <div
        className={cn(
          "col-start-1 col-end-2 row-start-1 row-end-2 w-full transition-transform transform-gpu",
          isLoading
            ? "scale-0 opacity-0 pointer-events-none"
            : "scale-100 opacity-100",
          className,
        )}
      >
        {children}
      </div>
      <div
        className={cn(
          "col-start-1 col-end-2 row-start-1 row-end-2 transition-transform transform-gpu",
          isLoading
            ? "scale-100 opacity-100"
            : "scale-0 opacity-0 pointer-events-none",
          className,
        )}
      >
        <Spinner />
      </div>
    </div>
  );
}
