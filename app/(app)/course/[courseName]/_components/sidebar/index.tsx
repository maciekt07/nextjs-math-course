"use client";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, PanelLeft, PanelLeftClose, Settings } from "lucide-react";
import dynamic from "next/dynamic";
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

import { useScrollShadows } from "@/hooks/useScrollShadows";
import { authClient } from "@/lib/auth/auth-client";
import { cn } from "@/lib/ui";
import type { Chapter, Course, Lesson, Media } from "@/payload-types";
import { useSidebarStore } from "@/stores/sidebar-store";
import { LessonItem } from "./lesson-item";
import { SidebarAccount } from "./sidebar-account";

const SettingsDialogContent = dynamic(() =>
  import("./settings-dialog-content").then((mod) => mod.SettingsDialogContent),
);

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
  const { data: session, isPending } = authClient.useSession();
  const [_isTransitionLoading, startTransition] = useTransition();
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [expandedChapters, setExpandedChapters] = useState<string[]>([]);
  const animate = useRef<boolean>(false);

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

  const groupedChapters = useMemo(
    () => groupLessonsByChapter(lessons, chapters),
    [lessons, chapters],
  );

  useEffect(() => {
    const t = setTimeout(() => {
      animate.current = true;
    }, 1000);
    return () => clearTimeout(t);
  }, []);

  const activeChapterId = useMemo(() => {
    for (const { chapter, lessons } of groupedChapters) {
      if (
        lessons.some((lesson) =>
          getActiveLessonPath(pathname, optimisticPath, course.slug!, lesson),
        )
      ) {
        return chapter.id;
      }
    }
    return null;
  }, [groupedChapters, pathname, optimisticPath, course.slug]);

  useEffect(() => {
    if (!open || !activeChapterId) return;
    setExpandedChapters((prev) =>
      prev.includes(activeChapterId) ? prev : [...prev, activeChapterId],
    );
  }, [activeChapterId, open]);

  const handleLessonClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, nextPath: string) => {
      e.preventDefault();

      const isSameLesson = nextPath === optimisticPath;
      const isMobile = window.innerWidth < 768;

      setOptimisticPath(nextPath);

      startTransition(() => {
        if (!isSameLesson) {
          router.push(nextPath);
          return;
        }

        if (isMobile) {
          setOpen(false);
          return;
        }

        requestAnimationFrame(() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        });
      });
    },
    [router, optimisticPath, setOpen, setOptimisticPath],
  );

  useEffect(() => {
    const lessonRegex = /^\/course\/[^/]+\/[^/]+$/;
    if (lessonRegex.test(pathname)) {
      setOptimisticPath(pathname);
      if (!animate.current) return;
      // close on mobile after router push completes
      if (window.innerWidth < 768) {
        startTransition(() => {
          requestAnimationFrame(() => {
            setOpen(false);
          });
        });
      }
    }
  }, [pathname, setOptimisticPath, setOpen]);

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
              transition={{ duration: 0.2 }}
            >
              <Button
                variant="outline"
                size="icon"
                className="cursor-pointer"
                onClick={() => setSettingsOpen(true)}
              >
                <Settings />
              </Button>
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
          onClick={() => toggle()}
          className={cn(
            "transition-all duration-300 cursor-pointer bg-background",
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
              transition={{ duration: 0.2 }}
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

      {/* top bar */}
      <AnimatePresence>
        {!open && (
          <motion.div
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "fixed top-0 left-0 right-0 z-40 h-17 hidden max-[1450px]:flex max-[1450px]:backdrop-blur-xl max-[1450px]:bg-background/60 max-[1450px]:border-b items-center mb-4 gap-3 transition-[border-color] duration-300",
            )}
          />
        )}
      </AnimatePresence>

      {/* settings dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <SettingsDialogContent />
      </Dialog>
      {/* FIXME: disable content scroll on Safari */}
      <motion.div
        animate={
          open
            ? { opacity: 1, pointerEvents: "auto" }
            : { opacity: 0, pointerEvents: "none" }
        }
        transition={{ duration: 0.2 }}
        onClick={() => setOpen(false)}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 md:hidden"
      />

      <motion.aside
        data-open={open}
        initial={false}
        layout={false}
        animate={open ? { x: 0 } : { x: -320 }}
        transition={{ type: "tween", duration: 0.2 }}
        className="fixed flex flex-col h-dvh w-80 border-r bg-background z-40 shadow-2xl md:shadow-none overflow-y-auto will-change-transform md:will-change-auto"
      >
        <div className="pt-14 sm:pt-16 px-4 border-b">
          <Button asChild variant="ghost" className="absolute top-4 right-4">
            <Link href="/">
              <ChevronLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </Button>

          <div className="flex md:block gap-3 mb-3 mt-2">
            {course.media && (
              <div className="relative w-20 h-20 md:w-full md:h-40 shrink-0 overflow-hidden rounded-lg md:rounded-2xl shadow-md md:mb-4">
                <Image
                  src={(course.media as Media).url!}
                  alt={(course.media as Media).alt ?? course.title!}
                  fill
                  priority
                  sizes="(min-width: 768px) 287px, 80px"
                  className="object-cover"
                  placeholder={
                    (course.media as Media).blurhash ? "blur" : "empty"
                  }
                  blurDataURL={(course.media as Media).blurhash || undefined}
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
        <div className="relative flex-1 min-h-[128px] overflow-hidden">
          <div className="h-full overflow-y-auto" ref={scrollRef}>
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
                          data-animate={animate.current}
                        >
                          <span>{chapter.title}</span>
                        </AccordionTrigger>
                        <AccordionContent
                          className="px-0 py-0"
                          data-animate={animate.current}
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
          <Button
            variant="outline"
            className="w-full mb-3 cursor-pointer"
            aria-label="Open settings"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings className="w-4 h-4" /> Settings
          </Button>
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
