"use client";
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
  const lessonRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());
  const hasInitialScrollRun = useRef(false);
  const previousOpen = useRef(open);

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

  const scrollLessonIntoView = useCallback((lessonPath: string) => {
    const lessonElement = lessonRefs.current.get(lessonPath);
    if (!lessonElement) return false;
    lessonElement.scrollIntoView({
      behavior: "auto",
      block: "center",
      inline: "nearest",
    });
    return true;
  }, []);

  useEffect(() => {
    const didJustOpen = open && !previousOpen.current;
    const shouldRunInitialScroll = !hasInitialScrollRun.current && open;

    previousOpen.current = open;

    if (!activeLessonPath || (!didJustOpen && !shouldRunInitialScroll)) return;
    if (activeChapterId && !expandedChapters.includes(activeChapterId)) return;

    let firstFrame = 0;
    let secondFrame = 0;

    firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        if (scrollLessonIntoView(activeLessonPath)) {
          hasInitialScrollRun.current = true;
        }
      });
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
    };
  }, [
    activeChapterId,
    activeLessonPath,
    expandedChapters,
    open,
    scrollLessonIntoView,
  ]);

  return {
    registerLessonRef,
  };
}
