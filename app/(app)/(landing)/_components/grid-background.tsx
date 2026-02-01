import type { ComponentProps } from "react";
import { cn } from "@/lib/ui";

export function GridBackground({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      aria-hidden
      className={cn(
        "absolute inset-x-0 top-0 -z-10 bg-background",
        "h-[980px] sm:h-[1080px] md:h-[1080px] lg:h-[720px]",
        "bg-[linear-gradient(to_right,rgba(0,0,0,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.06)_1px,transparent_1px)]",
        "[background-size:32px_32px] [background-position:16px_16px]",
        "dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)]",
        "[mask-image:linear-gradient(to_bottom,transparent_0%,black_50%,black_80%,transparent_100%),linear-gradient(to_right,transparent_0%,black_10%,black_90%,transparent_100%)]",
        "[mask-composite:intersect]",
        "[-webkit-mask-composite:source-in]",
        "[mask-repeat:no-repeat]",
        "[mask-size:100%_100%]",
        className,
      )}
      {...props}
    />
  );
}
