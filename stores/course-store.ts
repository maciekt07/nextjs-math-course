import { create } from "zustand";
import type { Course, Lesson } from "@/types/payload-types";

type CourseStore = {
  course: Course | null;
  setCourse: (course: Course) => void;
  lessonsMeta: Lesson[]; //FIXME: not a full type
  setLessonsMeta: (lessonsMeta: Lesson[]) => void;
  initialize: (course: Course, lessons: Lesson[]) => void;
  reset: () => void;
};

export const useCourseStore = create<CourseStore>((set) => ({
  course: null,
  lessonsMeta: [],
  setCourse: (course) => set({ course }),
  setLessonsMeta: (lessonsMeta) => set({ lessonsMeta }),
  initialize: (course, lessonsMeta) => set({ course, lessonsMeta }),
  reset: () => set({ course: null, lessonsMeta: [] }),
}));
