"use client";

import type React from "react";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/stores/settings-store";

export function MarkdownWrapper({ children }: { children: React.ReactNode }) {
  const coloredMarkdown = useSettingsStore((state) => state.coloredMarkdown);
  const largeMath = useSettingsStore((state) => state.largeMath);

  return (
    <div
      className={cn(
        "markdown-wrapper prose dark:prose-invert max-w-none break-words",
        coloredMarkdown && "colored-markdown marker:text-primary",
        largeMath && "large-math",
      )}
      style={{ contentVisibility: "auto", containIntrinsicSize: "1000px" }}
    >
      {children}
    </div>
  );
}
