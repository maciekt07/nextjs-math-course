import type { LucideIcon } from "lucide-react";
import type * as React from "react";
import { cn } from "@/lib/ui";

interface EmptyStateProps extends React.ComponentProps<"div"> {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  iconColor?: string;
  iconBgColor?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  iconColor = "text-primary",
  iconBgColor = "bg-primary/10",
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center px-8 my-8 space-y-4",
        className,
      )}
      {...props}
    >
      {Icon && (
        <div
          className={cn(
            "flex size-24 items-center justify-center rounded-full",
            iconBgColor,
          )}
        >
          <Icon className={cn("size-12", iconColor)} />
        </div>
      )}

      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h2>

      {description && (
        <p className="max-w-md text-muted-foreground">{description}</p>
      )}

      {action && <div className="my-1">{action}</div>}
    </div>
  );
}

export function EmptyStateCenterWrapper({
  children,
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex min-h-[calc(100dvh-68px)] items-center justify-center overflow-hidden pb-18 sm:pb-0",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
