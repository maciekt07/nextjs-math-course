"use client";
import { AnimatePresence, motion } from "framer-motion";
import {
  BadgeCheck,
  ChevronLeft,
  PanelLeft,
  PanelLeftClose,
  Settings,
} from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import BuyCourseButton from "@/components/buy-course-button";
import { ThemeSelect } from "@/components/theme-select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { authClient } from "@/lib/auth/auth-client";
import { cn } from "@/lib/utils";
import type { Course, Lesson, Media } from "@/payload-types";
import { useSidebarStore } from "@/stores/sidebar-store";
import { LessonItem } from "./lesson-item";
import { SidebarAccount } from "./sidebar-account";

const SettingsDialogContent = dynamic(
  () =>
    import("./settings-dialog-content").then(
      (mod) => mod.SettingsDialogContent,
    ),
  {
    ssr: false,
  },
);

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
  const open = useSidebarStore((state) => state.open);
  const setOpen = useSidebarStore((state) => state.setOpen);
  const toggle = useSidebarStore((state) => state.toggle);
  const optimisticPath = useSidebarStore((state) => state.optimisticPath);
  const setOptimisticPath = useSidebarStore((state) => state.setOptimisticPath);
  const { data: session, isPending } = authClient.useSession();
  const [_isTransitionLoading, startTransition] = useTransition();
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);

  const handleLessonClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, lessonPath: string) => {
      e.preventDefault();
      setOptimisticPath(lessonPath);
      // navigate with transition for smoother experience
      startTransition(() => {
        router.push(lessonPath);
      });
    },
    [setOptimisticPath, router],
  );

  const handleToggle = () => {
    toggle();
  };

  useEffect(() => {
    const lessonRegex = /^\/course\/[^/]+\/[^/]+$/;
    if (lessonRegex.test(pathname)) {
      setOptimisticPath(pathname);
      if (window.innerWidth < 768) {
        setOpen(false);
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
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
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
        transition={{ duration: 0.2 }}
        onClick={() => setOpen(false)}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 md:hidden"
      />

      <motion.aside
        initial={false}
        layout={false}
        animate={open ? { x: 0, opacity: 1 } : { x: -320, opacity: 0.8 }}
        transition={{ duration: 0.2 }}
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
                fetchPriority="high"
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

                return (
                  <LessonItem
                    key={lesson.id}
                    lesson={lesson}
                    courseSlug={course.slug!}
                    isActive={isActive}
                    owned={owned}
                    onClick={handleLessonClick}
                  />
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
