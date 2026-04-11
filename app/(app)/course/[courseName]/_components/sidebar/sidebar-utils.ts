import type { Chapter, Lesson } from "@/types/payload-types";

export interface ChapterLessonsGroup {
  chapter: Chapter;
  lessons: Lesson[];
}

export const getChapterId = (chapter: Lesson["chapter"]): string => {
  if (!chapter) return "";
  return typeof chapter === "object" ? chapter.id : chapter;
};

export const getLessonPath = (courseSlug: string, lesson: Lesson): string =>
  `/course/${courseSlug}/${lesson.slug}`;

export const groupLessonsByChapter = (
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
    .filter(({ lessons: chapterLessons }) => chapterLessons.length > 0);
};

export const getActiveLessonPath = (
  pathname: string,
  optimisticPath: string | null,
  courseSlug: string,
  lesson: Lesson,
): boolean => {
  const lessonPath = getLessonPath(courseSlug, lesson);

  return (
    optimisticPath === lessonPath ||
    (optimisticPath === null && pathname === lessonPath)
  );
};

export const findActiveLessonPath = ({
  lessons,
  pathname,
  optimisticPath,
  courseSlug,
}: {
  lessons: Lesson[];
  pathname: string;
  optimisticPath: string | null;
  courseSlug: string;
}): string | null => {
  const activeLesson = lessons.find((lesson) =>
    getActiveLessonPath(pathname, optimisticPath, courseSlug, lesson),
  );

  return activeLesson ? getLessonPath(courseSlug, activeLesson) : null;
};

export const findActiveChapterId = ({
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
