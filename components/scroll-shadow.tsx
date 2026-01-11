import type { ComponentProps } from "react";
import { cn } from "@/lib/ui";

interface ScrollShadowProps extends ComponentProps<"div"> {
  position: "top" | "bottom";
  show: boolean;
}

/**
 * renders a gradient shadow at the top or bottom of a scrollable container
 */
export function ScrollShadow({
  position,
  show,
  className,
  ...props
}: ScrollShadowProps) {
  const gradientClass =
    position === "top"
      ? "bg-gradient-to-b from-background to-transparent"
      : "bg-gradient-to-t from-background to-transparent";

  return (
    <div
      className={cn(
        "pointer-events-none absolute left-0 right-0 transition-opacity duration-200 h-8",
        `${position}-0`,
        gradientClass,
        show ? "opacity-100" : "opacity-0",
        className,
      )}
      {...props}
    />
  );
}
