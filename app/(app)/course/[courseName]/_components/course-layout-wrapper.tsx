"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect } from "react";
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
      <motion.div
        data-open={open}
        className="hidden md:block shrink-0 overflow-hidden"
        initial={false}
        animate={{ width: open ? 320 : 0 }}
        transition={{
          type: "tween",
          duration: prefersReducedMotion ? 0 : 0.2,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
      />

      <CourseSidebar
        course={course}
        lessons={lessons}
        chapters={chapters}
        owned={owned}
      />

      <motion.div className="flex-1 flex flex-col min-w-0">
        <motion.main
          data-open={open}
          className="flex-1 w-full min-w-0"
          initial={false}
          animate={{ paddingTop: open ? 0 : 68 }}
          transition={{
            type: "tween",
            duration: prefersReducedMotion ? 0 : 0.2,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        >
          {children}
        </motion.main>
      </motion.div>
    </div>
  );
}
