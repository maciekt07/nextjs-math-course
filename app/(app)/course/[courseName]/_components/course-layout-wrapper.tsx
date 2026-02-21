"use client";

import { motion } from "framer-motion";
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
        className="hidden md:block shrink-0"
        initial={{ width: 320 }}
        animate={{ width: open ? 320 : 0 }}
        transition={{ duration: 0.2 }}
      />

      <CourseSidebar
        course={course}
        lessons={lessons}
        chapters={chapters}
        owned={owned}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <motion.main
          className="flex-1 w-full min-w-0"
          initial={{ paddingTop: 0 }}
          animate={{ paddingTop: open ? 0 : 68 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
