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
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import BuyCourseButton from "@/components/buy-course-button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import type { Course, Lesson, Media } from "@/payload-types";

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
  const { data: session, isPending } = authClient.useSession();
  const [open, setOpen] = useState(true);

  return (
    <>
      <div className="fixed top-4 left-4 z-50 flex items-center gap-3 md:gap-4">
        <Button
          variant={open ? "ghost" : "outline"}
          size="icon"
          onClick={() => setOpen(!open)}
          className={cn(
            "transition-all duration-300 cursor-pointer",
            !open && "bg-background backdrop-blur-md",
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
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="backdrop-blur-md rounded-md"
            >
              <Button variant="outline" asChild>
                <Link href="/">
                  <ChevronLeft className="w-4 h-4" />
                  Home
                </Link>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence mode="wait">
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />

            <motion.aside
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                opacity: { duration: 0.2 },
              }}
              className="fixed md:relative flex flex-col h-full w-80 border-r bg-background z-40 md:z-auto shadow-2xl md:shadow-none"
            >
              <div className="pt-16 px-4 pb-4 border-b">
                <Button
                  asChild
                  variant="ghost"
                  className="absolute top-4 right-4"
                >
                  <Link href="/">
                    <ChevronLeft className="w-4 h-4" />
                    Back to Home
                  </Link>
                </Button>
                {course.media && (
                  <div className="relative w-full h-40 mb-4 mt-2 overflow-hidden rounded-2xl shadow-md">
                    <Image
                      src={(course.media as Media).url!}
                      alt={(course.media as Media).alt ?? ""}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-105"
                      priority
                    />
                    <div className="absolute inset-0 bg-black/20"></div>
                  </div>
                )}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-lg leading-tight">
                      {course.title}
                    </h2>
                    {/* TODO: move this */}
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
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="p-4">
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Lessons · {lessons.length}
                    </p>
                  </div>
                  <nav className="space-y-1">
                    {lessons.map((lesson, index) => {
                      const lessonPath = `/course/${course.slug}/${lesson.slug}`;
                      const isActive = pathname === lessonPath;
                      const isQuiz = lesson.type === "quiz";
                      const Icon = isQuiz ? ClipboardList : FileText;

                      return (
                        <Link
                          key={lesson.id}
                          href={lessonPath}
                          title={lesson.title}
                          onClick={() => {
                            if (window.innerWidth < 768) setOpen(false); // close sidebar on mobile
                          }}
                        >
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className={cn(
                              "group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                              isActive
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "hover:bg-secondary/80 text-muted-foreground hover:text-foreground",
                            )}
                          >
                            <div
                              className={cn(
                                "flex h-8 w-8 items-center justify-center rounded-md shrink-0 transition-colors",
                                isActive
                                  ? "bg-primary-foreground/20"
                                  : isQuiz
                                    ? "bg-red-500/10 text-red-600 dark:text-red-500 group-hover:bg-red-500/20"
                                    : "bg-primary/10 text-primary group-hover:bg-primary/20",
                              )}
                            >
                              <Icon className="w-4 h-4" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium leading-tight truncate">
                                {lesson.title}
                              </p>
                              <p className="text-xs truncate">
                                {isQuiz && (
                                  <span>{lesson.quiz?.length} tasks</span>
                                )}
                              </p>
                            </div>

                            {!lesson.free && !owned && (
                              <Lock className="w-4 h-4 shrink-0 text-orange-600 dark:text-orange-500" />
                            )}
                          </motion.div>
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              </div>

              <div className="p-4 border-t mt-auto bg-background">
                {isPending ? (
                  <div className="flex items-center justify-center py-3">
                    <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : session?.user ? (
                  <div className="space-y-2">
                    <Link
                      href="/account"
                      className="flex items-center gap-3 rounded-lg hover:bg-secondary/80 transition-all duration-200 p-2 -mx-2"
                    >
                      <Avatar className="h-9 w-9 ring-2 ring-background">
                        <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-sm">
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

                    {!owned && (
                      <BuyCourseButton
                        courseId={course.id}
                        variant="outline"
                        className="w-full"
                        size="sm"
                      >
                        Buy Course
                      </BuyCourseButton>
                    )}
                  </div>
                ) : (
                  <Button asChild className="w-full" size="sm">
                    <Link
                      href={`/auth/sign-in?returnTo=${encodeURIComponent(pathname)}`}
                    >
                      <LogIn className="w-4 h-4" />
                      Log In
                    </Link>
                  </Button>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
