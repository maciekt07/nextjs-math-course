import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/ui";

const lastUsedBadgeVariants = cva("animate-in zoom-in duration-200", {
  variants: {
    variant: {
      floating:
        "absolute right-2 top-1/2 -translate-y-1/2 max-[430px]:right-[-8px] max-[430px]:top-[-1px] max-[430px]:bg-card",
      inline: "absolute right-0",
    },
  },
  defaultVariants: {
    variant: "floating",
  },
});

interface LastUsedBadgeProps
  extends Omit<ComponentProps<typeof Badge>, "variant">,
    VariantProps<typeof lastUsedBadgeVariants> {}

export function LastUsedBadge({
  className,
  variant,
  ...props
}: LastUsedBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(lastUsedBadgeVariants({ variant }), className)}
      {...props}
    >
      Last used
    </Badge>
  );
}
