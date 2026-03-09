"use client";

import { useReducedMotion } from "motion/react";
import { useEffect } from "react";
import { cn } from "@/lib/ui";
import { useCourseStore } from "@/stores/course-store";
import { useSidebarStore } from "@/stores/sidebar-store";
import type { Chapter, Course, Lesson } from "@/types/payload-types";
import { CourseSidebar } from "./sidebar";

export function CourseLayoutWrapper({
  course,
  lessons,
  chapters,
  owned,
  children,
}: {
  course: Course;
  lessons: Lesson[];
  chapters: Chapter[];
  owned?: boolean;
  children: React.ReactNode;
}) {
  const open = useSidebarStore((state) => state.open);
  const setOpen = useSidebarStore((state) => state.setOpen);
  const setOptimisticPath = useSidebarStore((state) => state.setOptimisticPath);
  const initialize = useCourseStore((state) => state.initialize);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    initialize(course, lessons);
  }, [initialize, course, lessons]);

  useEffect(() => {
    return () => {
      setOptimisticPath(null);
      setOpen(true);
    };
  }, [setOptimisticPath, setOpen]);

  return (
    <div className="flex flex-col md:flex-row min-h-screen relative overflow-x-hidden">
      <div
        data-open={open}
        className={cn(
          "hidden md:block shrink-0 w-80 overflow-hidden",
          !prefersReducedMotion && "transition-[width] sidebar-transition",
          open ? "w-80" : "w-0",
        )}
      />

      <CourseSidebar
        course={course}
        lessons={lessons}
        chapters={chapters}
        owned={owned}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <main
          data-open={open}
          className={cn(
            "flex-1 w-full min-w-0",
            !prefersReducedMotion &&
              "transition-[padding-top] sidebar-transition",
            open ? "pt-0" : "pt-[68px]",
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
