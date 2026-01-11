"use client";

import katex from "katex";
import { memo, useEffect, useRef } from "react";

interface KatexRendererProps {
  content: string;
  block?: boolean;
}

const katexCache = new Map<string, string>();

export const KatexRenderer = memo(
  ({ content, block = false }: KatexRendererProps) => {
    const divRef = useRef<HTMLDivElement>(null);
    const spanRef = useRef<HTMLSpanElement>(null);
    const cacheKey = `${block ? "block" : "inline"}:${content}`;
    useEffect(() => {
      const el = block ? divRef.current : spanRef.current;
      if (!el) return;

      if (el.dataset.value === content) return;

      const renderFormula = () => {
        try {
          if (katexCache.has(cacheKey)) {
            el.innerHTML = katexCache.get(cacheKey)!;
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
      };

      // lazy render only when visible
      const observer = new IntersectionObserver(
        (entries) => {
          if (!entries[0].isIntersecting) return;

          if ("requestIdleCallback" in window) {
            const id = window.requestIdleCallback(renderFormula);
            return () => window.cancelIdleCallback(id);
          } else {
            const id = setTimeout(renderFormula, 0);
            return () => clearTimeout(id);
          }
        },
        { rootMargin: "500px" },
      );

      observer.observe(el);
      return () => observer.disconnect();
    }, [content, block, cacheKey]);

    return block ? (
      <div
        ref={divRef}
        className="flex items-center justify-center min-h-[56px]"
      />
    ) : (
      <span ref={spanRef} />
    );
  },
  (prev, next) => prev.content === next.content && prev.block === next.block,
);

KatexRenderer.displayName = "KatexRenderer";
