"use client";

import { useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

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
  const [pendingScrollTarget, setPendingScrollTarget] = useState<string | null>(
    null,
  );

  const registerLessonRef = useCallback(
    (lessonPath: string, node: HTMLAnchorElement | null) => {
      if (node) {
        lessonRefs.current.set(lessonPath, node);
        return;
      }

      lessonRefs.current.delete(lessonPath);
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
    setPendingScrollTarget(lessonPath);
  }, []);

  useEffect(() => {
    if (!activeLessonPath) return;
    setPendingScrollTarget(activeLessonPath);
  }, [activeLessonPath]);

  useEffect(() => {
    if (!open || !activeLessonPath) return;
    setPendingScrollTarget(activeLessonPath);
  }, [open, activeLessonPath]);

  useEffect(() => {
    if (!open || !pendingScrollTarget) return;

    if (activeChapterId && !expandedChapters.includes(activeChapterId)) {
      return;
    }

    let firstFrame = 0;
    let secondFrame = 0;

    firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        if (!scrollLessonIntoView(pendingScrollTarget)) return;

        setPendingScrollTarget((currentTarget) =>
          currentTarget === pendingScrollTarget ? null : currentTarget,
        );
      });
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
    };
  }, [
    activeChapterId,
    expandedChapters,
    open,
    pendingScrollTarget,
    scrollLessonIntoView,
  ]);

  return {
    queueLessonScroll,
    registerLessonRef,
    scrollLessonIntoView,
  };
}
