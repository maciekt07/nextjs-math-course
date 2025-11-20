"use client";

import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

export function LessonTOC({
  headings,
}: {
  headings: { id: string; text: string; level: number }[];
}) {
  const [activeId, setActiveId] = useState<string | null>(null);

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
        // when element enters top 30% of viewport
        rootMargin: "0px 0px -70% 0px",
        threshold: 0,
      },
    );

    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length <= 1) {
    return null;
  }

  return (
    <>
      <div className="hidden max-[1690px]:block mb-6">
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
              <div className="space-y-3 mt-3">
                {headings.map((h) => (
                  <a
                    key={h.id}
                    href={`#${h.id}`}
                    className={cn(
                      "block text-[16px] text-muted-foreground transition-colors leading-tight hover:text-foreground",
                      h.level === 3 && "pl-4",
                    )}
                  >
                    {h.text}
                  </a>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="hidden min-[1690px]:block fixed right-0 top-20 w-64 max-h-[70vh] overflow-auto border-l pl-6">
        <h4 className="text-xs font-medium mb-4 uppercase tracking-wide text-muted-foreground/80">
          In this lesson
        </h4>

        <div className="space-y-3">
          {headings.map((h) => (
            <a
              key={h.id}
              href={`#${h.id}`}
              onClick={() =>
                setTimeout(() => {
                  setActiveId(h.id);
                }, 10)
              }
              className={cn(
                "group flex items-start gap-2 text-sm transition-colors leading-tight",
                h.level === 3 && "pl-4",
                activeId === h.id
                  ? "text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  "mt-1 h-2 w-2 rounded-full transition-all",
                  activeId === h.id
                    ? "bg-primary"
                    : "bg-muted-foreground/40 group-hover:bg-muted-foreground/70",
                )}
              />
              <span>{h.text}</span>
            </a>
          ))}
        </div>
      </div>
    </>
  );
}
