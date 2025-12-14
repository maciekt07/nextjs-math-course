"use client";

import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { Heading } from "@/lib/markdown/extract-headings";
import { scrollToHeader } from "@/lib/markdown/scroll-to-header";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/stores/sidebar-store";

export function LessonTOC({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sidebarOpen = useSidebarStore((s) => s.open);

  function handleHeaderClick(id: string) {
    scrollToHeader(id, {
      sidebarOpen,
    });

    //FIXME:
    setTimeout(() => {
      setActiveId(id);
    }, 10);
  }

  useEffect(() => {
    function handleHash() {
      const hash = decodeURIComponent(location.hash.slice(1));
      if (!hash) return;
      // ensures correct offset if user has closed sidebar to see content on mobile
      requestAnimationFrame(() => {
        scrollToHeader(hash, {
          sidebarOffset: 0,
        });
      });
    }

    handleHash();

    window.addEventListener("hashchange", handleHash);
    return () => {
      window.removeEventListener("hashchange", handleHash);
    };
  }, []);

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
      <div className="hidden max-[1704px]:block mb-6 font-inter">
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
                    onClick={(e) => {
                      e.preventDefault();
                      handleHeaderClick(h.id);
                    }}
                    className={cn(
                      "group flex items-start gap-2 text-[16px] text-muted-foreground transition-colors leading-tight hover:text-foreground",
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

      <div className="hidden min-[1704px]:block fixed right-4 top-24 w-64 max-h-[70vh] overflow-auto border-l pl-6 font-inter">
        <h4 className="text-xs font-medium mb-4 uppercase tracking-wide text-muted-foreground/80">
          In this lesson
        </h4>

        <div className="space-y-3">
          {headings.map((h) => (
            <a
              key={h.id}
              href={`#${h.id}`}
              onClick={(e) => {
                e.preventDefault();
                handleHeaderClick(h.id);
              }}
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
              <span className="line-clamp-3">{h.text}</span>
            </a>
          ))}
        </div>
      </div>
    </>
  );
}
