import { type ReactNode, useEffect, useState } from "react";
import { CircleCheck } from "@/components/animate-ui/icons/circle-check";
import { CircleX } from "@/components/animate-ui/icons/circle-x";
import { Loader } from "@/components/animate-ui/icons/loader";
import { cn } from "@/lib/ui";

type Status = "success" | "error";

const STATUS_ICONS: Record<
  Status,
  { Icon: typeof CircleCheck; colorClassName: string }
> = {
  success: { Icon: CircleCheck, colorClassName: "text-success-foreground" },
  error: { Icon: CircleX, colorClassName: "text-destructive" },
};

export function LoadingSwap({
  isLoading,
  isSuccess = false,
  isError = false,
  children,
  className,
}: {
  isLoading: boolean;
  isSuccess?: boolean;
  isError?: boolean;
  children: ReactNode;
  className?: string;
}) {
  const status: Status | null = isSuccess
    ? "success"
    : isError
      ? "error"
      : null;

  return (
    <div className="grid grid-cols-1 items-center justify-items-center relative">
      <div
        className={cn(
          "col-start-1 col-end-2 row-start-1 row-end-2 w-full transition-transform transform-gpu",
          isLoading || status
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
        <Loader animate loop />
      </div>
      {status && (
        <StatusIcon
          key={`${status}-${Date.now()}`}
          status={status}
          className={className}
        />
      )}
    </div>
  );
}

function StatusIcon({
  status,
  className,
}: {
  status: Status;
  className?: string;
}) {
  const [visible, setVisible] = useState(false);
  const { Icon, colorClassName } = STATUS_ICONS[status];

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
      className={cn(
        "col-start-1 col-end-2 row-start-1 row-end-2 transition-transform transform-gpu",
        visible ? "scale-100 opacity-100" : "scale-0 opacity-0",
        className,
      )}
    >
      <Icon animate className={cn("size-5", colorClassName)} />
    </div>
  );
}
