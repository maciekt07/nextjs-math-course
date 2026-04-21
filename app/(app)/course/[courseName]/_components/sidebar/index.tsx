"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { defaultPatterns } from "web-haptics";
import { useWebHaptics } from "web-haptics/react";
import { ScrollShadow } from "@/components/scroll-shadow";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Dialog } from "@/components/ui/dialog";
import { useMounted } from "@/hooks/use-mounted";
import { useScrollShadows } from "@/hooks/use-scroll-shadows";
import { authClient } from "@/lib/auth/auth-client";
import { cn } from "@/lib/ui";
import { useSidebarStore } from "@/stores/sidebar-store";
import type { Chapter, Course, Lesson } from "@/types/payload-types";
import { LessonItem } from "./lesson-item";
import { SettingsDialogContent } from "./settings-dialog-content";
import { SidebarControls } from "./sidebar-controls";
import { SidebarCourseHeader } from "./sidebar-course-header";
import { SidebarFooter } from "./sidebar-footer";
import {
  findActiveChapterId,
  findActiveLessonPath,
  getLessonPath,
  groupLessonsByChapter,
} from "./sidebar-utils";
import { useActiveLessonScroll } from "./use-active-lesson-scroll";

export function CourseSidebar({
  course,
  lessons,
  chapters,
  owned,
}: {
  course: Course;
  lessons: Lesson[];
  chapters: Chapter[];
  owned?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { trigger } = useWebHaptics();
  const open = useSidebarStore((state) => state.open);
  const setOpen = useSidebarStore((state) => state.setOpen);
  const toggle = useSidebarStore((state) => state.toggle);
  const optimisticPath = useSidebarStore((state) => state.optimisticPath);
  const setOptimisticPath = useSidebarStore((state) => state.setOptimisticPath);
  const groupedChapters = useMemo(
    () => groupLessonsByChapter(lessons, chapters),
    [lessons, chapters],
  );
  const initialActiveChapterId = findActiveChapterId({
    groupedChapters,
    pathname,
    optimisticPath,
    courseSlug: course.slug!,
  });
  const { data: session, isPending } = authClient.useSession();
  const [_isTransitionLoading, startTransition] = useTransition();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [expandedChapters, setExpandedChapters] = useState<string[]>(() =>
    initialActiveChapterId ? [initialActiveChapterId] : [],
  );
  const prefersReducedMotion = useReducedMotion();
  const reducedMotion = prefersReducedMotion ?? false;
  const mounted = useMounted();

  const {
    ref: scrollRef,
    showTop,
    showBottom,
  } = useScrollShadows<HTMLDivElement>({
    topOffset: 64,
  });

  const unassignedLessons = useMemo(
    () => lessons.filter((lesson) => !lesson.chapter),
    [lessons],
  );

  const activeChapterId = useMemo(
    () =>
      findActiveChapterId({
        groupedChapters,
        pathname,
        optimisticPath,
        courseSlug: course.slug!,
      }),
    [groupedChapters, pathname, optimisticPath, course.slug],
  );

  const activeLessonPath = useMemo(
    () =>
      findActiveLessonPath({
        lessons,
        pathname,
        optimisticPath,
        courseSlug: course.slug!,
      }),
    [lessons, pathname, optimisticPath, course.slug],
  );

  const { registerLessonRef } = useActiveLessonScroll({
    activeChapterId,
    activeLessonPath,
    expandedChapters,
    open,
  });

  useEffect(() => {
    if (!open || !activeChapterId) return;

    startTransition(() => {
      setExpandedChapters((prev) =>
        prev.includes(activeChapterId) ? prev : [...prev, activeChapterId],
      );
    });
  }, [activeChapterId, open]);

  const handleLessonClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, nextPath: string) => {
      e.preventDefault();
      trigger(defaultPatterns.light);
      const isMobile = window.innerWidth < 768;
      const current = optimisticPath ?? pathname;
      const isSameLesson = nextPath === current;

      setOptimisticPath(nextPath);

      if (isMobile) {
        setOpen(false);
        setTimeout(() => {
          if (!isSameLesson) {
            router.push(nextPath);
          }
        }, 200);
        return;
      }

      if (!isSameLesson) {
        router.push(nextPath);
      }
    },
    [optimisticPath, pathname, router, setOpen, setOptimisticPath, trigger],
  );

  return (
    <>
      <SidebarControls
        open={open}
        prefersReducedMotion={reducedMotion}
        onOpenSettings={() => setSettingsOpen(true)}
        onToggleSidebar={() => {
          toggle();
          trigger();
        }}
      />

      <AnimatePresence>
        {!open && (
          <motion.div
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
            className={cn(
              "fixed top-0 left-0 right-0 z-40 h-17 hidden max-[1450px]:flex max-[1450px]:backdrop-blur-xl max-[1450px]:bg-background/60 max-[1450px]:border-b items-center mb-4 gap-3 transition-[border-color] duration-300",
              "safari-ios:bg-background! safari-ios:backdrop-blur-none!",
            )}
          />
        )}
      </AnimatePresence>

      {/*
          fix ios 26 safari drop support for meta theme-color
          https://github.com/andesco/safari-color-tinting
      */}
      <div className="fixed top-0 left-0 right-0 z-41 h-3 bg-background hidden safari-ios:block md:hidden" />

      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-41 h-3 bg-background hidden safari-ios:block md:hidden",
          !open && "hidden!",
        )}
      />

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <SettingsDialogContent />
      </Dialog>

      {mounted ? (
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 h-dvh bg-white/50 dark:bg-black/50 backdrop-blur-xs z-40 md:hidden"
            />
          )}
        </AnimatePresence>
      ) : (
        <div className="fixed inset-0 h-dvh bg-white/50 dark:bg-black/50 backdrop-blur-xs z-40 md:hidden" />
      )}

      <motion.aside
        data-open={open}
        initial={false}
        layout={false}
        animate={open ? { x: 0, opacity: 1 } : { x: -320, opacity: 0 }}
        transition={{
          type: "tween",
          duration: reducedMotion ? 0 : 0.2,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
        className="fixed flex flex-col h-dvh w-80 border-r bg-background z-40 shadow-2xl md:shadow-none overflow-y-auto will-change-transform transform-gpu"
        style={{ transform: "translateZ(0)" }}
      >
        <SidebarCourseHeader course={course} owned={owned} />

        <div className="relative flex-1 min-h-32 overflow-hidden">
          <div
            className="h-full overflow-y-auto overscroll-none"
            ref={scrollRef}
          >
            <ScrollShadow position="top" show={showTop} />
            <div>
              {groupedChapters.length > 0 && (
                <Accordion
                  type="multiple"
                  value={expandedChapters}
                  onValueChange={setExpandedChapters}
                  className="w-full border-t border-b first:border-t-0"
                >
                  {groupedChapters.map(
                    ({ chapter, lessons: chapterLessons }) => (
                      <AccordionItem key={chapter.id} value={chapter.id}>
                        <AccordionTrigger
                          onClick={() => trigger(defaultPatterns.light)}
                          className="px-4 sm:py-4 py-6 font-medium text-sm hover:no-underline cursor-pointer rounded-none transition-none hover:bg-muted/70"
                          data-animate={mounted && !reducedMotion}
                        >
                          <span>{chapter.title}</span>
                        </AccordionTrigger>

                        <AccordionContent
                          className="px-0 py-0"
                          data-animate={mounted && !reducedMotion}
                        >
                          <nav className="px-2 pb-2 mt-2">
                            {chapterLessons.map((lesson) => {
                              const lessonPath = getLessonPath(
                                course.slug!,
                                lesson,
                              );

                              return (
                                <LessonItem
                                  key={lesson.id}
                                  lesson={lesson}
                                  courseSlug={course.slug!}
                                  isActive={lessonPath === activeLessonPath}
                                  owned={owned}
                                  onClick={handleLessonClick}
                                  registerRef={registerLessonRef}
                                />
                              );
                            })}
                          </nav>
                        </AccordionContent>
                      </AccordionItem>
                    ),
                  )}
                </Accordion>
              )}

              <div className="py-3">
                {unassignedLessons.length > 0 && (
                  <div className="mb-4 space-y-1 px-2">
                    {unassignedLessons.map((lesson) => {
                      const lessonPath = getLessonPath(course.slug!, lesson);

                      return (
                        <LessonItem
                          key={lesson.id}
                          lesson={lesson}
                          courseSlug={course.slug!}
                          isActive={lessonPath === activeLessonPath}
                          owned={owned}
                          onClick={handleLessonClick}
                          registerRef={registerLessonRef}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
          <ScrollShadow position="bottom" show={showBottom} />
        </div>

        <SidebarFooter
          isPending={isPending}
          onOpenSettings={() => setSettingsOpen(true)}
          pathname={pathname}
          session={session}
        />
      </motion.aside>
    </>
  );
}
