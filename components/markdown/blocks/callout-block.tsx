import type { ReactNode } from "react";
import { cn } from "@/lib/ui";
import { BLOCK_CONFIG, type BlockType } from "./callout-config";

interface CalloutBlockProps {
  type: BlockType;
  title?: string;
  children: ReactNode;
}

export function CalloutBlock({ type, title, children }: CalloutBlockProps) {
  const config = BLOCK_CONFIG[type];

  return (
    <div
      role="note"
      className={cn(
        "block rounded-xl px-4 py-3 sm:px-5 sm:py-4 my-4 border-1",
        config.bg,
      )}
    >
      <div className="flex items-center gap-2 text-sm font-medium mb-2">
        {config.Icon && <config.Icon size={24} className={config.title} />}
        <span className={cn("text-lg", config.title)}>
          {title ?? config.label}
        </span>
      </div>

      <div className="text-md leading-relaxed text-foreground/85">
        {children}
      </div>
    </div>
  );
}
