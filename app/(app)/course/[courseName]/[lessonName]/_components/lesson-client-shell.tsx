"use client";

import { type ReactNode, useEffect } from "react";
import { openDyslexic } from "@/lib/fonts";
import { scrollToHeader } from "@/lib/markdown/scroll-to-header";
import { cn } from "@/lib/ui";
import { useSettingsStore } from "@/stores/settings-store";

interface Props {
  children: ReactNode;
  type: string;
}

export function LessonClientShell({ children, type }: Props) {
  const fontStyle = useSettingsStore((state) => state.fontStyle);

  const fontClass = {
    default: "font-inter",
    system: "font-system",
    dyslexic: "font-dyslexic",
  }[fontStyle];

  useEffect(() => {
    const scrollToHash = () => {
      const hash = window.location.hash.slice(1);
      if (hash) {
        scrollToHeader(hash, { force: true });
      }
    };

    scrollToHash();

    const onHashChange = (e: HashChangeEvent) => {
      e.preventDefault();
      scrollToHash();
    };

    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return (
    <article
      className={cn(
        "mx-auto pb-8 mt-10 px-4 sm:px-6",
        type === "video" ? "max-w-6xl" : "max-w-4xl",
        fontClass,
        fontStyle === "dyslexic" && openDyslexic.variable,
      )}
    >
      {children}
    </article>
  );
}
