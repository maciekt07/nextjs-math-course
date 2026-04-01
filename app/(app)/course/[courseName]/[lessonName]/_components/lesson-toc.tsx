"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ScrollShadow } from "@/components/scroll-shadow";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useScrollShadows } from "@/hooks/use-scroll-shadows";
import type { Heading } from "@/lib/markdown/extract-headings";
import { scrollToHeader } from "@/lib/markdown/scroll-to-header";
import { cn } from "@/lib/ui";

function useActiveHeading(ids: string[], enabled: boolean) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const suppressUntil = useRef<number>(0);

  useEffect(() => {
    if (!enabled || !ids?.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (Date.now() < suppressUntil.current) return;

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
  }, [ids, enabled]);

  const forceActive = useCallback((id: string) => {
    suppressUntil.current = Date.now() + 1000;
    setActiveId(id);
  }, []);

  return { activeId, forceActive };
}

export function LessonTOC({ headings }: { headings: Heading[] }) {
  const isDesktop = useMediaQuery("(min-width: 1704px)");
  const itemIds = useMemo(() => headings.map((h) => h.id), [headings]);
  const { activeId, forceActive } = useActiveHeading(itemIds, isDesktop);
  const {
    ref: scrollRef,
    showTop,
    showBottom,
  } = useScrollShadows<HTMLDivElement>({
    topOffset: 24,
    bottomOffset: 0,
  });

  const tocItemRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());

  useEffect(() => {
    if (!isDesktop || !activeId) return;
    const el = tocItemRefs.current.get(activeId);
    const container = scrollRef.current;
    if (!el || !container) return;

    const elTop = el.offsetTop;
    const elBottom = elTop + el.offsetHeight;
    const containerTop = container.scrollTop;
    const containerBottom = containerTop + container.clientHeight;
    const margin = 80;

    if (elTop - margin < containerTop) {
      container.scrollTo({ top: elTop - margin, behavior: "smooth" });
    } else if (elBottom + margin > containerBottom) {
      container.scrollTo({
        top: elBottom + margin - container.clientHeight,
        behavior: "smooth",
      });
    }
  }, [activeId, isDesktop, scrollRef.current]);

  if (headings.length <= 1) return null;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    forceActive(id);
    scrollToHeader(id);
  };

  return (
    <>
      {/* accordion for mobile */}
      <div className="hidden max-[1704px]:block mb-10 font-inter">
        <Accordion
          type="single"
          collapsible
          className="bg-card rounded-2xl px-6 border"
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
      <div className="hidden min-[1704px]:block fixed right-0 top-24 w-64 font-inter bg-background">
        <div className="relative">
          <div className="overflow-y-auto max-h-[70vh] pl-2" ref={scrollRef}>
            <p className="text-xs font-medium mb-4 uppercase tracking-wide text-muted-foreground/80">
              In this lesson
            </p>
            <div className="space-y-3">
              {headings.map((h) => (
                <a
                  key={h.id}
                  href={`#${h.id}`}
                  ref={(el) => {
                    if (el) tocItemRefs.current.set(h.id, el);
                    else tocItemRefs.current.delete(h.id);
                  }}
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
                      "mt-1 w-2 h-2 shrink-0 rounded-full transition-colors",
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
          <ScrollShadow show={showTop} position="top" className="h-12" />
          <ScrollShadow show={showBottom} position="bottom" className="h-12" />
        </div>
      </div>
    </>
  );
}
