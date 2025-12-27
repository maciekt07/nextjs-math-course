import type * as React from "react";
import { cn } from "@/lib/ui";

type EmptyStateProps = {
  icon?: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
  iconColor?: string;
  iconBgColor?: string;
  className?: string;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  iconColor = "text-primary",
  iconBgColor = "bg-primary/10",
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center px-8 my-8 space-y-4",
        className,
      )}
    >
      {Icon && (
        <div
          className={cn(
            "flex h-24 w-24 items-center justify-center rounded-full",
            iconBgColor,
          )}
        >
          <Icon className={cn("h-12 w-12", iconColor)} />
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
