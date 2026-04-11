"use client";
import { ChevronLeft, PanelLeft, PanelLeftClose } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { AnimateIcon } from "@/components/animate-ui/icons/icon";
import { Settings } from "@/components/animate-ui/icons/settings";
import BuyCourseButton from "@/components/buy-course-button";
import { ScrollShadow } from "@/components/scroll-shadow";
import { ThemeSelect } from "@/components/theme-select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useMounted } from "@/hooks/use-mounted";
import { useScrollShadows } from "@/hooks/use-scroll-shadows";
import { authClient } from "@/lib/auth/auth-client";
import { cn } from "@/lib/ui";
import { useSidebarStore } from "@/stores/sidebar-store";
import type { Chapter, Course, Lesson, Poster } from "@/types/payload-types";
import { LessonItem } from "./lesson-item";
import { SettingsDialogContent } from "./settings-dialog-content";
import { SidebarAccount } from "./sidebar-account";

interface ChapterLessonsGroup {
  chapter: Chapter;
  lessons: Lesson[];
}

const getChapterId = (chapter: Lesson["chapter"]): string => {
  if (!chapter) return "";
  return typeof chapter === "object" ? chapter.id : chapter;
};

const groupLessonsByChapter = (
  lessons: Lesson[],
  chapters: Chapter[],
): ChapterLessonsGroup[] => {
  return chapters
    .map((chapter) => ({
      chapter,
      lessons: lessons.filter(
        (lesson) =>
          lesson.chapter && getChapterId(lesson.chapter) === chapter.id,
      ),
    }))
    .filter(({ lessons }) => lessons.length > 0);
};

const findActiveChapterId = ({
  groupedChapters,
  pathname,
  optimisticPath,
  courseSlug,
}: {
  groupedChapters: ChapterLessonsGroup[];
  pathname: string;
  optimisticPath: string | null;
  courseSlug: string;
}): string | null => {
  for (const { chapter, lessons } of groupedChapters) {
    if (
      lessons.some((lesson) =>
        getActiveLessonPath(pathname, optimisticPath, courseSlug, lesson),
      )
    ) {
      return chapter.id;
    }
  }

  return null;
};

const getActiveLessonPath = (
  pathname: string,
  optimisticPath: string | null,
  courseSlug: string,
  lesson: Lesson,
): boolean => {
  const lessonPath = `/course/${courseSlug}/${lesson.slug}`;
  return (
    optimisticPath === lessonPath ||
    (optimisticPath === null && pathname === lessonPath)
  );
};

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
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [expandedChapters, setExpandedChapters] = useState<string[]>(() =>
    initialActiveChapterId ? [initialActiveChapterId] : [],
  );
  const [pendingScrollTarget, setPendingScrollTarget] = useState<string | null>(
    null,
  );
  const prefersReducedMotion = useReducedMotion();
  const mounted = useMounted();
  const lessonRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());

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

  const activeChapterId = useMemo(() => {
    return findActiveChapterId({
      groupedChapters,
      pathname,
      optimisticPath,
      courseSlug: course.slug!,
    });
  }, [groupedChapters, pathname, optimisticPath, course.slug]);

  const activeLessonPath = useMemo(() => {
    const activeLesson = lessons.find((lesson) =>
      getActiveLessonPath(pathname, optimisticPath, course.slug!, lesson),
    );

    return activeLesson ? `/course/${course.slug}/${activeLesson.slug}` : null;
  }, [lessons, pathname, optimisticPath, course.slug]);

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

  useEffect(() => {
    if (!open || !activeChapterId) return;
    startTransition(() => {
      setExpandedChapters((prev) =>
        prev.includes(activeChapterId) ? prev : [...prev, activeChapterId],
      );
    });
  }, [activeChapterId, open]);

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

  const handleLessonClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, nextPath: string) => {
      e.preventDefault();

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
      } else {
        if (!isSameLesson) {
          scrollLessonIntoView(nextPath);
          setPendingScrollTarget(nextPath);
          router.push(nextPath);
        }
      }
    },
    [
      router,
      optimisticPath,
      pathname,
      scrollLessonIntoView,
      setOpen,
      setOptimisticPath,
    ],
  );

  return (
    <>
      <div className="flex items-center flex-row-reverse fixed top-4 right-4 z-50 gap-3">
        <ThemeSelect />
        <AnimatePresence>
          {!open && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
            >
              <AnimateIcon animateOnHover>
                <Button
                  variant="outline"
                  size="icon"
                  className="cursor-pointer"
                  onClick={() => setSettingsOpen(true)}
                >
                  <Settings />
                </Button>
              </AnimateIcon>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* top-left controls */}
      <div className="fixed top-4 left-4 z-50 flex items-center gap-3">
        <Button
          variant={open ? "ghost" : "outline"}
          size="icon"
          aria-label="Toggle Sidebar"
          onClick={() => startTransition(() => toggle())}
          className={cn(
            "cursor-pointer bg-background",
            !open && "backdrop-blur-md",
          )}
        >
          {open ? (
            <PanelLeftClose className="w-5 h-5" />
          ) : (
            <PanelLeft className="w-5 h-5" />
          )}
        </Button>

        <AnimatePresence mode="wait">
          {!open && (
            <motion.div
              key="home-button"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
              className="rounded-md"
            >
              <Button variant="outline" asChild className="backdrop-blur-md">
                <Link href="/">
                  <ChevronLeft className="w-4 h-4" />
                  Home
                </Link>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {!open && (
          <motion.div
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
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

      {/* settings dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <SettingsDialogContent />
      </Dialog>
      {/* FIXME: disable content scroll on Safari */}
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
          duration: prefersReducedMotion ? 0 : 0.2,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
        className="fixed flex flex-col h-dvh w-80 border-r bg-background z-40 shadow-2xl md:shadow-none overflow-y-auto will-change-transform transform-gpu"
        style={{ transform: "translateZ(0)" }}
      >
        <div className="pt-14 sm:pt-16 px-4 border-b">
          <Button asChild variant="ghost" className="absolute top-4 right-4">
            <Link href="/">
              <ChevronLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </Button>

          <div className="flex md:block gap-3 mb-3 mt-2">
            {course.poster && (
              <div className="relative w-20 h-20 md:w-full md:h-40 shrink-0 overflow-hidden rounded-lg md:rounded-2xl shadow-md md:mb-4">
                <Image
                  src={(course.poster as Poster).url!}
                  alt={(course.poster as Poster).alt ?? course.title!}
                  fill
                  priority
                  sizes="(min-width: 768px) 287px, 80px"
                  className="object-cover"
                  placeholder={
                    (course.poster as Poster).blurhash ? "blur" : "empty"
                  }
                  blurDataURL={(course.poster as Poster).blurhash || undefined}
                />
              </div>
            )}
            <div className="flex-1 min-w-0 md:hidden space-y-1">
              <h2 className="font-semibold text-base leading-tight">
                {course.title}
              </h2>
              {course.description && (
                <p
                  className="text-xs text-muted-foreground line-clamp-2"
                  title={course.description}
                >
                  {course.description}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <div className="hidden md:flex items-center gap-2">
              <h2 className="font-semibold text-lg leading-tight">
                {course.title}
              </h2>
            </div>

            {course.description && (
              <div className="line-clamp-3 md:mb-3">
                <p
                  className="hidden md:block text-sm text-muted-foreground"
                  title={course.description}
                >
                  {course.description}
                </p>
              </div>
            )}

            {!owned && (
              <BuyCourseButton
                courseId={course.id}
                variant="outline"
                className="w-full font-bold mb-3"
                size="default"
              >
                Buy Course
              </BuyCourseButton>
            )}
          </div>
        </div>
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
                          className="px-4 sm:py-4 py-6 font-medium text-sm hover:no-underline cursor-pointer rounded-none transition-none hover:bg-muted/70"
                          data-animate={mounted && !prefersReducedMotion}
                        >
                          <span>{chapter.title}</span>
                        </AccordionTrigger>
                        <AccordionContent
                          className="px-0 py-0"
                          data-animate={mounted && !prefersReducedMotion}
                        >
                          <nav className="px-2 pb-2 mt-2">
                            {chapterLessons.map((lesson) => (
                              <LessonItem
                                key={lesson.id}
                                lesson={lesson}
                                courseSlug={course.slug!}
                                isActive={getActiveLessonPath(
                                  pathname,
                                  optimisticPath,
                                  course.slug!,
                                  lesson,
                                )}
                                owned={owned}
                                onClick={handleLessonClick}
                                registerRef={registerLessonRef}
                              />
                            ))}
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
                    {unassignedLessons.map((lesson) => (
                      <LessonItem
                        key={lesson.id}
                        lesson={lesson}
                        courseSlug={course.slug!}
                        isActive={getActiveLessonPath(
                          pathname,
                          optimisticPath,
                          course.slug!,
                          lesson,
                        )}
                        owned={owned}
                        onClick={handleLessonClick}
                        registerRef={registerLessonRef}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <ScrollShadow position="bottom" show={showBottom} />
        </div>

        <div className="p-4 border-t bg-background">
          <AnimateIcon animateOnHover>
            <Button
              variant="outline"
              className="w-full mb-3 cursor-pointer"
              aria-label="Open settings"
              onClick={() => setSettingsOpen(true)}
            >
              <Settings className="w-4 h-4" /> Settings
            </Button>
          </AnimateIcon>
          <SidebarAccount
            isPending={isPending}
            session={session}
            pathname={pathname}
          />
        </div>
      </motion.aside>
    </>
  );
}
