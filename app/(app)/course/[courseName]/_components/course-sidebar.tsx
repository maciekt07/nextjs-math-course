"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  BadgeCheck,
  ChevronLeft,
  ClipboardList,
  FileText,
  Lock,
  LogIn,
  PanelLeft,
  PanelLeftClose,
  Settings,
  Video,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { SettingsDialogContent } from "@/app/(app)/course/[courseName]/_components/settings-dialog-content";
import BuyCourseButton from "@/components/buy-course-button";
import { ThemeSelect } from "@/components/theme-select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth/auth-client";
import { formatDuration, formatReadingTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Course, Lesson, Media, MuxVideo } from "@/payload-types";
import { useSidebarStore } from "@/stores/sidebar-store";

const lessonTypeConfig = {
  quiz: {
    icon: ClipboardList,
    color: {
      base: "bg-red-500/10 text-red-600 dark:text-red-500",
      hover: "group-hover:bg-red-500/20",
    },
  },
  video: {
    icon: Video,
    color: {
      base: "bg-green-500/10 text-green-600 dark:text-green-400",
      hover: "group-hover:bg-green-500/20",
    },
  },
  default: {
    icon: FileText,
    color: {
      base: "bg-primary/10 text-primary",
      hover: "group-hover:bg-primary/20",
    },
  },
};

export function CourseSidebar({
  course,
  lessons,
  owned,
}: {
  course: Course;
  lessons: Lesson[];
  owned?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { open, setOpen, toggle, optimisticPath, setOptimisticPath } =
    useSidebarStore();
  const { data: session, isPending } = authClient.useSession();
  const [_isTransitionLoading, startTransition] = useTransition();
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);

  const handleLessonClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    lessonPath: string,
  ) => {
    e.preventDefault();

    setOptimisticPath(lessonPath);

    if (window.innerWidth < 768) {
      setOpen(false);
    }

    // navigate with transition for smoother experience
    startTransition(() => {
      router.push(lessonPath);
    });
  };

  const handleToggle = () => {
    toggle();
  };

  useEffect(() => {
    const lessonRegex = /^\/course\/[^/]+\/[^/]+$/;
    if (lessonRegex.test(pathname)) {
      setOptimisticPath(pathname);
    }
  }, [pathname, setOptimisticPath]);

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
              transition={{ duration: 0.3, ease: "easeOut" }}
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
          onClick={handleToggle}
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
              transition={{ duration: 0.3, ease: "easeInOut" }}
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
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed top-0 left-0 z-40 h-17 backdrop-blur-lg bg-background/60 border-b flex items-center px-4 mb-4 gap-3 pointer-events-none"
            style={{
              right: "16px",
              paddingLeft: "max(1rem, env(safe-area-inset-left))",
            }}
          ></motion.div>
        )}
      </AnimatePresence>

      {/* settings dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <SettingsDialogContent />
      </Dialog>

      <motion.div
        animate={
          open
            ? { opacity: 1, pointerEvents: "auto" }
            : { opacity: 0, pointerEvents: "none" }
        }
        transition={{ duration: 0.3, ease: "easeInOut" }}
        onClick={() => setOpen(false)}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 md:hidden"
      />

      <motion.aside
        initial={false}
        animate={open ? { x: 0, opacity: 1 } : { x: -320, opacity: 0.8 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed flex flex-col h-full w-80 border-r bg-background z-40 shadow-2xl md:shadow-none overflow-y-auto"
      >
        <div className="pt-16 px-4 pb-4 border-b">
          <Button asChild variant="ghost" className="absolute top-4 right-4">
            <Link href="/">
              <ChevronLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </Button>

          {course.media && (
            <div className="relative w-full h-40 mb-4 mt-2 overflow-hidden rounded-2xl shadow-md">
              <Image
                src={(course.media as Media).url!}
                alt={(course.media as Media).alt ?? course.title!}
                fill
                className="object-cover"
                priority
                placeholder={
                  (course.media as Media).blurhash ? "blur" : "empty"
                }
                blurDataURL={(course.media as Media).blurhash || undefined}
              />
              <div className="absolute inset-0 bg-black/20"></div>
            </div>
          )}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-lg leading-tight">
                {course.title}
              </h2>
              {owned && (
                <Badge variant="secondary" className="shrink-0">
                  <BadgeCheck className="w-3 h-3 mr-1" />
                  Owned
                </Badge>
              )}
            </div>
            {course.description && (
              <p
                className="text-sm text-muted-foreground line-clamp-3"
                title={course.description}
              >
                {course.description}
              </p>
            )}
            {!owned && (
              <BuyCourseButton
                courseId={course.id}
                variant="outline"
                className="w-full mt-3 font-bold"
                size="lg"
              >
                Buy Course
              </BuyCourseButton>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-[128px]">
          <div className="p-4">
            <div className="mb-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Lessons · {lessons.length}
              </p>
            </div>
            <nav className="space-y-1">
              {lessons.map((lesson) => {
                const lessonPath = `/course/${course.slug}/${lesson.slug}`;
                const isActive =
                  optimisticPath === lessonPath ||
                  (optimisticPath === null && pathname === lessonPath);

                const typeConfig =
                  lessonTypeConfig[
                    lesson.type as keyof typeof lessonTypeConfig
                  ] || lessonTypeConfig.default;

                const Icon = typeConfig.icon;

                const videoDuration =
                  lesson.type === "video"
                    ? ((lesson.video as MuxVideo)?.duration ?? null)
                    : null;

                return (
                  <Link
                    key={lesson.id}
                    href={lessonPath}
                    title={lesson.title}
                    prefetch={true}
                    onClick={(e) => handleLessonClick(e, lessonPath)}
                  >
                    <div
                      className={cn(
                        "group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-secondary/80 text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-sm shrink-0 transition-colors",
                          isActive
                            ? "bg-primary-foreground/20"
                            : `${typeConfig.color.base} ${typeConfig.color.hover}`,
                        )}
                      >
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-tight truncate">
                          {lesson.title}
                        </p>
                        {lesson.type === "quiz" && (
                          <p className="text-xs truncate">
                            {lesson.quiz?.length
                              ? `${lesson.quiz.length} task${lesson.quiz.length > 1 ? "s" : ""}`
                              : "no tasks"}
                          </p>
                        )}

                        {lesson.type === "video" && videoDuration && (
                          <p className="text-xs truncate">
                            {formatDuration(videoDuration || 0)}
                          </p>
                        )}

                        {lesson.type === "text" &&
                          lesson.readingTimeSeconds != null && (
                            <p className="text-xs truncate">
                              {formatReadingTime(lesson.readingTimeSeconds)}
                            </p>
                          )}
                      </div>
                      {!lesson.free && !owned && (
                        <Lock className="w-4 h-4 shrink-0 text-orange-600 dark:text-orange-500" />
                      )}
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="p-4 border-t mt-auto bg-background">
          <Button
            variant="outline"
            className="w-full mb-3 cursor-pointer"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings className="w-4 h-4" /> Settings
          </Button>

          {isPending ? (
            <div className="space-y-2">
              <div className="flex items-center gap-3 rounded-lg p-2 -mx-2">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="flex-1 min-w-0 space-y-1.5">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            </div>
          ) : session?.user ? (
            <div className="space-y-2">
              <Link
                href="/account"
                className="flex items-center gap-3 rounded-lg hover:bg-secondary/80 transition-all duration-200 p-2 -mx-2"
              >
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                    {session.user.name?.charAt(0).toUpperCase() ||
                      session.user.email?.charAt(0).toUpperCase() ||
                      "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-tight truncate">
                    {session.user.name || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {session.user.email}
                  </p>
                </div>
              </Link>
            </div>
          ) : (
            <Button asChild className="w-full" size="sm">
              <Link
                href={{
                  pathname: "/auth/sign-in",
                  query: { returnTo: pathname },
                }}
              >
                <LogIn className="w-4 h-4" />
                Log In
              </Link>
            </Button>
          )}
        </div>
      </motion.aside>
    </>
  );
}
