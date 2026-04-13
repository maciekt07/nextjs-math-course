"use client";
import { useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef } from "react";

interface UseActiveLessonScrollOptions {
  activeChapterId: string | null;
  activeLessonPath: string | null;
  expandedChapters: string[];
  open: boolean;
}

export function useActiveLessonScroll({
  activeChapterId,
  activeLessonPath,
  expandedChapters,
  open,
}: UseActiveLessonScrollOptions) {
  const prefersReducedMotion = useReducedMotion();
  const lessonRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());
  const pendingScrollTarget = useRef<string | null>(null);

  const registerLessonRef = useCallback(
    (lessonPath: string, node: HTMLAnchorElement | null) => {
      if (node) {
        lessonRefs.current.set(lessonPath, node);
      } else {
        lessonRefs.current.delete(lessonPath);
      }
    },
    [],
  );

  const scrollLessonIntoView = useCallback(
    (lessonPath: string) => {
      const lessonElement = lessonRefs.current.get(lessonPath);
      if (!lessonElement) return false;
      lessonElement.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "center",
        inline: "nearest",
      });
      return true;
    },
    [prefersReducedMotion],
  );

  const queueLessonScroll = useCallback((lessonPath: string | null) => {
    pendingScrollTarget.current = lessonPath;
  }, []);

  useEffect(() => {
    if (activeLessonPath) {
      pendingScrollTarget.current = activeLessonPath;
    }
  }, [activeLessonPath]);

  useEffect(() => {
    if (open && activeLessonPath) {
      pendingScrollTarget.current = activeLessonPath;
    }
  }, [open, activeLessonPath]);

  useEffect(() => {
    if (!open || !pendingScrollTarget.current) return;
    if (activeChapterId && !expandedChapters.includes(activeChapterId)) return;

    const target = pendingScrollTarget.current;
    let firstFrame = 0;
    let secondFrame = 0;

    firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        if (scrollLessonIntoView(target)) {
          pendingScrollTarget.current = null;
        }
      });
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
    };
  }, [activeChapterId, expandedChapters, open, scrollLessonIntoView]);

  return {
    queueLessonScroll,
    registerLessonRef,
    scrollLessonIntoView,
  };
}
