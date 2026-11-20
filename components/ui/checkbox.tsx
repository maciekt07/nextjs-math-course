"use client";

import { Checkbox as CheckboxPrimitive } from "@animate-ui/react/primitives/radix-ui";
import type * as React from "react";

import { cn } from "@/lib/ui";

function CheckIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      color="currentColor"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
      {...props}
    >
      <path
        d="M5 14L8.5 17.5L19 6.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </svg>
  );
}

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer relative flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input outline-none transition-colors duration-300 dark:bg-input/30 data-[state=checked]:text-primary-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 disabled:cursor-not-allowed disabled:opacity-50",
        "before:absolute before:-inset-px before:scale-70 before:rounded-[inherit] before:bg-primary before:opacity-0 before:transition-[scale,opacity] before:duration-300 motion-reduce:before:scale-100 data-[state=checked]:before:scale-100 data-[state=checked]:before:opacity-100",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="relative grid place-content-center text-current transition-none [&>svg]:size-3.5"
      >
        <CheckIcon />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
