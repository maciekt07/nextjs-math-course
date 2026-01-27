"use client";

import { useEffect, useRef, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { Heading } from "@/lib/markdown/extract-headings";
import { scrollToHeader } from "@/lib/markdown/scroll-to-header";
import { cn } from "@/lib/ui";

export function LessonTOC({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const headingsRef = useRef(headings);

  useEffect(() => {
    headingsRef.current = headings;
  }, [headings]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleHeaders: { id: string; distance: number }[] = [];

        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const rect = entry.boundingClientRect;
            // positive = below top, negative = above top
            const distance = rect.top;
            visibleHeaders.push({
              id: entry.target.id,
              distance: distance,
            });
          }
        });

        if (visibleHeaders.length > 0) {
          const closestHeader = visibleHeaders.reduce((closest, current) =>
            Math.abs(current.distance) < Math.abs(closest.distance)
              ? current
              : closest,
          );
          setActiveId(closestHeader.id);
        }
      },
      {
        // when element enters top 20% of viewport
        rootMargin: "0px 0px -80% 0px",
        threshold: 0,
      },
    );

    const currentHeadings = headingsRef.current;
    currentHeadings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  if (headings.length <= 1) {
    return null;
  }

  const handleTOCClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string,
  ) => {
    e.preventDefault();
    scrollToHeader(id);
    setActiveId(id);
  };

  return (
    <>
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
                    onClick={(e) => handleTOCClick(e, h.id)}
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

      <div className="hidden min-[1704px]:block fixed right-2 top-24 w-64 max-h-[70vh] overflow-auto pl-6 font-inter">
        <p className="text-xs font-medium mb-4 uppercase tracking-wide text-muted-foreground/80">
          In this lesson
        </p>

        <div className="space-y-3">
          {headings.map((h) => (
            <a
              key={h.id}
              href={`#${h.id}`}
              onClick={(e) => handleTOCClick(e, h.id)}
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
