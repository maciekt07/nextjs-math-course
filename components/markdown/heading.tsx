"use client";

import { useWebHaptics } from "web-haptics/react";
import { AnimateIcon } from "@/components/animate-ui/icons/icon";
import { Link } from "@/components/animate-ui/icons/link";
import { scrollToHeader } from "@/lib/markdown/scroll-to-header";
import { cn } from "@/lib/ui";

type HeadingProps = {
  as: "h2" | "h3";
  id: string;
  children: React.ReactNode;
};

export function Heading({ as: Tag, id, children }: HeadingProps) {
  const { trigger } = useWebHaptics();
  const iconSize = Tag === "h2" ? 18 : 16;

  return (
    <Tag
      id={id}
      className="group relative scroll-mt-6 max-[1450px]:[main[data-open='false']_&]:scroll-mt-23"
    >
      <AnimateIcon animateOnTap completeOnStop className="mt-0! pt-0!">
        <span className="inline">
          {children}
          <Link
            size={iconSize}
            aria-hidden="true"
            className={cn(
              "ml-2 inline align-baseline transition-opacity duration-200",
              "opacity-0",
              "group-hover:opacity-100",
              "group-focus-within:opacity-100",
              "[@media(pointer:coarse)]:opacity-40",
            )}
          />
        </span>
        <a
          href={`#${id}`}
          onClick={(e) => {
            e.preventDefault();
            scrollToHeader(id, { behavior: "smooth" });
            trigger();
          }}
          aria-label={`Link to ${id}`}
          className={cn(
            "absolute inset-0 z-20",
            "pointer-events-none",
            "group-hover:pointer-events-auto",
            "group-focus-within:pointer-events-auto",
            "[@media(pointer:coarse)]:pointer-events-auto",
          )}
        >
          <span className="sr-only">Link to {id}</span>
        </a>
      </AnimateIcon>
    </Tag>
  );
}
