"use client";

import katex from "katex";
import { memo, useEffect, useRef } from "react";

interface KatexRendererProps {
  content: string;
  block?: boolean;
  shouldLazy?: boolean;
}

const katexCache = new Map<string, string>();

export const KatexRenderer = memo(
  ({ content, block = false, shouldLazy = true }: KatexRendererProps) => {
    const divRef = useRef<HTMLDivElement>(null);
    const spanRef = useRef<HTMLSpanElement>(null);
    const cacheKey = `${block ? "block" : "inline"}:${content}`;

    useEffect(() => {
      const el = block ? divRef.current : spanRef.current;
      if (!el) return;

      if (el.dataset.value === content) return;

      let idleId: number | null = null;
      let timeoutId: ReturnType<typeof setTimeout> | null = null;

      const renderFormula = () => {
        try {
          const cached = katexCache.get(cacheKey);

          if (cached) {
            el.innerHTML = cached;
          } else {
            katex.render(content, el, {
              displayMode: block,
              throwOnError: false,
              strict: false,
            });

            katexCache.set(cacheKey, el.innerHTML);
          }
        } catch {
          el.textContent = content;
        }

        el.dataset.value = content;

        if (block) {
          el.removeAttribute("class");
        }
      };

      if (!shouldLazy) {
        renderFormula();
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          if (!entries[0]?.isIntersecting) return;

          observer.disconnect();

          if ("requestIdleCallback" in window) {
            idleId = window.requestIdleCallback(renderFormula);
          } else {
            timeoutId = setTimeout(renderFormula, 0);
          }
        },
        { rootMargin: "300px" },
      );

      observer.observe(el);

      return () => {
        observer.disconnect();

        if (idleId !== null) {
          window.cancelIdleCallback(idleId);
        }

        if (timeoutId !== null) {
          clearTimeout(timeoutId);
        }
      };
    }, [content, block, cacheKey, shouldLazy]);

    return block ? (
      <div ref={divRef} className="flex min-h-12 items-center justify-center" />
    ) : (
      <span ref={spanRef} />
    );
  },
  (prev, next) =>
    prev.content === next.content &&
    prev.block === next.block &&
    prev.shouldLazy === next.shouldLazy,
);

KatexRenderer.displayName = "KatexRenderer";
