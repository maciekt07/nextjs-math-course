"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { Heading } from "@/lib/markdown/extract-headings";
import { scrollToHeader } from "@/lib/markdown/scroll-to-header";
import { cn } from "@/lib/ui";

function useActiveHeading(ids: string[]) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (!ids?.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible: { id: string; distance: number }[] = [];

        for (const entry of entries) {
          if (entry.isIntersecting) {
            visible.push({
              id: entry.target.id,
              distance: entry.boundingClientRect.top,
            });
          }
        }

        if (visible.length) {
          const closest = visible.reduce((a, b) =>
            Math.abs(b.distance) < Math.abs(a.distance) ? b : a,
          );
          setActiveId(closest.id);
        }
      },
      { rootMargin: "0px 0px -80% 0px" },
    );

    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => {
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el) observer.unobserve(el);
      }
    };
  }, [ids]);

  return activeId;
}

export function LessonTOC({ headings }: { headings: Heading[] }) {
  const itemIds = useMemo(() => headings.map((h) => h.id), [headings]);
  const activeId = useActiveHeading(itemIds);

  if (headings.length <= 1) return null;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    scrollToHeader(id);
  };

  return (
    <>
      {/* accordion for mobile */}
      <div className="hidden max-[1704px]:block mb-6 font-inter sticky top-24">
        <Accordion
          type="single"
          collapsible
          className="bg-card rounded-2xl px-6 border-1"
        >
          <AccordionItem value="toc">
            <AccordionTrigger className="cursor-pointer">
              Table of contents
            </AccordionTrigger>
            <AccordionContent>
              <div className="mt-2">
                {headings.map((h) => (
                  <a
                    key={h.id}
                    href={`#${h.id}`}
                    onClick={(e) => handleClick(e, h.id)}
                    className={cn(
                      "group flex items-start gap-2 py-3 sm:py-2 text-[16px] text-muted-foreground transition-colors leading-tight hover:text-foreground",
                      h.level === 3 && "pl-4",
                    )}
                  >
                    <span className="mt-1 h-2 w-2 rounded-full transition-all bg-muted-foreground/40 group-hover:bg-muted-foreground/70" />
                    <span className="line-clamp-3">{h.text}</span>
                  </a>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* for desktop */}
      <div className="hidden min-[1704px]:block fixed right-2 top-24 w-64 max-h-[70vh] overflow-auto pl-6 font-inter">
        <p className="text-xs font-medium mb-4 uppercase tracking-wide text-muted-foreground/80">
          In this lesson
        </p>
        <div className="space-y-3">
          {headings.map((h) => (
            <a
              key={h.id}
              href={`#${h.id}`}
              onClick={(e) => handleClick(e, h.id)}
              data-active={activeId === h.id}
              className={cn(
                "group flex items-start gap-2 text-sm transition-color leading-tight",
                h.level === 3 && "pl-4",
                activeId === h.id
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  "mt-1 size-2 rounded-full transition-all",
                  activeId === h.id
                    ? "bg-primary"
                    : "bg-muted-foreground/40 group-hover:bg-muted-foreground/70",
                )}
              />
              <span className="line-clamp-3">{h.text}</span>
            </a>
          ))}
        </div>
      </div>
    </>
  );
}
