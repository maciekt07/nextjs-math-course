import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/ui";

const buttonVariants = cva(
  "font-inter relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 ease-out disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "button-sheen text-primary-foreground [--btn-top:var(--primary)] [--btn-bottom:color-mix(in_oklab,var(--primary)_72%,black_28%)] [--btn-top-dark:color-mix(in_oklab,var(--primary)_80%,var(--background)_20%)] [--btn-bottom-dark:color-mix(in_oklab,var(--primary)_62%,var(--background)_38%)]",
        destructive:
          "button-sheen text-white focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 [--btn-top:var(--destructive)] [--btn-bottom:color-mix(in_oklab,var(--destructive)_72%,black_28%)] [--btn-top-dark:color-mix(in_oklab,var(--destructive)_80%,var(--background)_20%)] [--btn-bottom-dark:color-mix(in_oklab,var(--destructive)_62%,var(--background)_38%)]",
        outline:
          "border border-[1.5px] bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "button-sheen text-secondary-foreground [--btn-highlight:rgba(255,255,255,0.22)] [--btn-top:color-mix(in_oklab,var(--secondary)_96%,white_4%)] [--btn-bottom:color-mix(in_oklab,var(--secondary)_82%,black_18%)] [--btn-top-dark:color-mix(in_oklab,var(--secondary)_86%,var(--background)_14%)] [--btn-bottom-dark:color-mix(in_oklab,var(--secondary)_72%,var(--background)_28%)]",
        green:
          "button-sheen text-white [--btn-top:oklch(62%_0.19_149)] [--btn-bottom:color-mix(in_oklab,oklch(54%_0.17_149)_88%,black_12%)] [--btn-top-dark:color-mix(in_oklab,oklch(62%_0.19_149)_80%,var(--background)_20%)] [--btn-bottom-dark:color-mix(in_oklab,oklch(54%_0.17_149)_76%,var(--background)_24%)]",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        xl: "h-12 rounded-md px-10 font-semibold has-[>svg]:px-6",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
