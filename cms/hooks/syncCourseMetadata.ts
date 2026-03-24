import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  Payload,
} from "payload";

type CourseMetadata = {
  lessonCount: number;
  totalQuizQuestions: number;
  totalReadingTimeSeconds: number;
  totalVideoSeconds: number;
  firstLessonSlug: string | null;
  firstFreeLessonSlug: string | null;
};

function getId(
  value:
    | string
    | null
    | undefined
    | {
        id: string;
      },
) {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

function compareOrder(
  aOrder: string | null | undefined,
  bOrder: string | null | undefined,
) {
  return (aOrder ?? "").localeCompare(bOrder ?? "");
}

async function calculateCourseMetadata(
  payload: Payload,
  courseId: string,
): Promise<CourseMetadata> {
  const [{ docs: chapters }, { docs: lessons }] = await Promise.all([
    payload.find({
      collection: "chapters",
      where: { course: { equals: courseId } },
      select: {
        id: true,
        _order: true,
      },
      limit: 1000,
    }),
    payload.find({
      collection: "lessons",
      where: { course: { equals: courseId } },
      select: {
        chapter: true,
        slug: true,
        free: true,
        quiz: true,
        readingTimeSeconds: true,
        videoDurationSeconds: true,
        type: true,
        _order: true,
      },
      limit: 10000,
    }),
  ]);

  const chapterIndex = new Map(
    chapters
      .slice()
      .sort((a, b) => compareOrder(a._order, b._order))
      .map((chapter, index) => [chapter.id, index]),
  );

  const metadata: CourseMetadata = {
    lessonCount: 0,
    totalQuizQuestions: 0,
    totalReadingTimeSeconds: 0,
    totalVideoSeconds: 0,
    firstLessonSlug: null,
    firstFreeLessonSlug: null,
  };

  const compareLessonPosition = <
    T extends {
      chapter?: string | { id: string } | null;
      _order?: string | null;
    },
  >(
    a: T,
    b: T,
  ) => {
    const aChapterId = getId(a.chapter);
    const bChapterId = getId(b.chapter);
    const aHasKnownChapter =
      aChapterId !== null && chapterIndex.has(aChapterId);
    const bHasKnownChapter =
      bChapterId !== null && chapterIndex.has(bChapterId);

    if (aHasKnownChapter && bHasKnownChapter) {
      const chapterDiff =
        chapterIndex.get(aChapterId!)! - chapterIndex.get(bChapterId!)!;
      if (chapterDiff !== 0) return chapterDiff;
    } else if (aHasKnownChapter) {
      return -1;
    } else if (bHasKnownChapter) {
      return 1;
    }

    return compareOrder(a._order, b._order);
  };

  let firstLesson: (typeof lessons)[number] | null = null;
  let firstFreeLesson: (typeof lessons)[number] | null = null;

  for (const lesson of lessons) {
    metadata.lessonCount++;

    if (lesson.type === "quiz") {
      metadata.totalQuizQuestions += lesson.quiz?.length ?? 0;
    }

    metadata.totalReadingTimeSeconds += lesson.readingTimeSeconds ?? 0;
    metadata.totalVideoSeconds += lesson.videoDurationSeconds ?? 0;

    if (
      lesson.slug &&
      (!firstLesson || compareLessonPosition(lesson, firstLesson) < 0)
    ) {
      firstLesson = lesson;
    }

    if (
      lesson.free &&
      lesson.slug &&
      (!firstFreeLesson || compareLessonPosition(lesson, firstFreeLesson) < 0)
    ) {
      firstFreeLesson = lesson;
    }
  }

  metadata.firstLessonSlug = firstLesson?.slug ?? null;
  metadata.firstFreeLessonSlug = firstFreeLesson?.slug ?? null;

  return metadata;
}

async function syncCourseMetadata(payload: Payload, courseId: string) {
  const [course, metadata] = await Promise.all([
    payload.findByID({
      collection: "courses",
      id: courseId,
      select: {
        lessonCount: true,
        totalQuizQuestions: true,
        totalReadingTimeSeconds: true,
        totalVideoSeconds: true,
        firstLessonSlug: true,
        firstFreeLessonSlug: true,
      },
    }),
    calculateCourseMetadata(payload, courseId),
  ]);

  const changed =
    course.lessonCount !== metadata.lessonCount ||
    course.totalQuizQuestions !== metadata.totalQuizQuestions ||
    course.totalReadingTimeSeconds !== metadata.totalReadingTimeSeconds ||
    course.totalVideoSeconds !== metadata.totalVideoSeconds ||
    course.firstLessonSlug !== metadata.firstLessonSlug ||
    course.firstFreeLessonSlug !== metadata.firstFreeLessonSlug;

  if (!changed) return;

  await payload.update({
    collection: "courses",
    id: courseId,
    data: metadata,
  });
}

async function syncCourseIds(payload: Payload, courseIds: (string | null)[]) {
  const uniqueCourseIds = [...new Set(courseIds.filter(Boolean))] as string[];

  await Promise.all(
    uniqueCourseIds.map((courseId) => syncCourseMetadata(payload, courseId)),
  );
}

export const syncLessonCourseMetadataAfterChange: CollectionAfterChangeHook =
  async ({ doc, previousDoc, req }) => {
    await syncCourseIds(req.payload, [
      getId(doc.course),
      getId(previousDoc?.course),
    ]);

    return doc;
  };

export const syncLessonCourseMetadataAfterDelete: CollectionAfterDeleteHook =
  async ({ doc, req }) => {
    await syncCourseIds(req.payload, [getId(doc.course)]);

    return doc;
  };

export const syncChapterCourseMetadataAfterChange: CollectionAfterChangeHook =
  async ({ doc, previousDoc, req }) => {
    await syncCourseIds(req.payload, [
      getId(doc.course),
      getId(previousDoc?.course),
    ]);

    return doc;
  };

export const syncChapterCourseMetadataAfterDelete: CollectionAfterDeleteHook =
  async ({ doc, req }) => {
    await syncCourseIds(req.payload, [getId(doc.course)]);

    return doc;
  };
