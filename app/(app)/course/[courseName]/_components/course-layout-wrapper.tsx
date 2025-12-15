"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import type { Course, Lesson } from "@/payload-types";
import { useCourseStore } from "@/stores/course-store";
import { useSidebarStore } from "@/stores/sidebar-store";
import { CourseSidebar } from "./sidebar";

export function CourseLayoutWrapper({
  course,
  lessons,
  owned,
  children,
}: {
  course: Course;
  lessons: Lesson[];
  owned?: boolean;
  children: React.ReactNode;
}) {
  const open = useSidebarStore((state) => state.open);
  const setOpen = useSidebarStore((state) => state.setOpen);
  const initialize = useCourseStore((state) => state.initialize);

  useEffect(() => {
    setOpen(true);
    initialize(course, lessons);
  }, [setOpen, initialize, course, lessons]);

  return (
    <div className="flex h-screen overflow-hidden relative">
      <motion.div
        className="hidden md:block shrink-0"
        initial={{ width: 320 }}
        animate={{
          width: open ? 320 : 0,
        }}
        transition={{
          duration: 0.2,
        }}
      />

      <CourseSidebar course={course} lessons={lessons} owned={owned} />

      <motion.main
        className="flex-1 overflow-y-auto"
        initial={{ paddingTop: 0 }}
        animate={{
          paddingTop: open ? 0 : 68,
        }}
        transition={{
          duration: 0.2,
        }}
      >
        {children}
      </motion.main>
    </div>
  );
}
