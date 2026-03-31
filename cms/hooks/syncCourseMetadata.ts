import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  PayloadRequest,
} from "payload";
import { buildPublishedStatusWhere } from "@/cms/access/contentAccess";
import { getId } from "@/cms/utils/get-id";
import { revalidateCourseCache } from "./revalidate";

type CourseMetadata = {
  lessonCount: number;
  totalQuizQuestions: number;
  totalReadingTimeSeconds: number;
  totalVideoSeconds: number;
  firstLessonSlug: string | null;
  firstFreeLessonSlug: string | null;
};

function compareOrder(
  aOrder: string | null | undefined,
  bOrder: string | null | undefined,
) {
  return (aOrder ?? "").localeCompare(bOrder ?? "");
}

async function calculateCourseMetadata(
  req: PayloadRequest,
  courseId: string,
): Promise<CourseMetadata> {
  const [{ docs: chapters }, { docs: lessons }] = await Promise.all([
    req.payload.find({
      req,
      collection: "chapters",
      overrideAccess: true,
      where: { course: { equals: courseId } },
      select: {
        id: true,
        _order: true,
      },
      limit: 1000,
    }),
    req.payload.find({
      req,
      collection: "lessons",
      overrideAccess: true,
      where: {
        and: [buildPublishedStatusWhere(), { course: { equals: courseId } }],
      },
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

async function syncCourseMetadata(req: PayloadRequest, courseId: string) {
  const [course, metadata] = await Promise.all([
    req.payload.findByID({
      req,
      collection: "courses",
      id: courseId,
      overrideAccess: true,
      select: {
        id: true,
        slug: true,
        lessonCount: true,
        totalQuizQuestions: true,
        totalReadingTimeSeconds: true,
        totalVideoSeconds: true,
        firstLessonSlug: true,
        firstFreeLessonSlug: true,
      },
    }),
    calculateCourseMetadata(req, courseId),
  ]);

  const changed =
    course.lessonCount !== metadata.lessonCount ||
    course.totalQuizQuestions !== metadata.totalQuizQuestions ||
    course.totalReadingTimeSeconds !== metadata.totalReadingTimeSeconds ||
    course.totalVideoSeconds !== metadata.totalVideoSeconds ||
    course.firstLessonSlug !== metadata.firstLessonSlug ||
    course.firstFreeLessonSlug !== metadata.firstFreeLessonSlug;

  if (!changed) {
    req.payload.logger.info(
      `Course metadata unchanged for ${courseId}, skipping update`,
    );
    return;
  }

  req.payload.logger.info(
    `Updating course metadata for ${courseId}: ${JSON.stringify(metadata)}`,
  );

  await req.payload.update({
    req,
    collection: "courses",
    id: courseId,
    overrideAccess: true,
    context: { disableRevalidate: true },
    data: metadata,
  });

  await revalidateCourseCache(req.payload, courseId, course.slug);
}

async function syncCourseIds(
  req: PayloadRequest,
  courseIds: (string | null)[],
) {
  const uniqueCourseIds = [...new Set(courseIds.filter(Boolean))] as string[];

  await Promise.all(
    uniqueCourseIds.map((courseId) => syncCourseMetadata(req, courseId)),
  );
}

export const syncLessonCourseMetadataAfterChange: CollectionAfterChangeHook =
  async ({ doc, previousDoc, req }) => {
    req.payload.logger.info(
      `Syncing course metadata after lesson change: ${doc.id}`,
    );
    await syncCourseIds(req, [getId(doc.course), getId(previousDoc?.course)]);

    return doc;
  };

export const syncLessonCourseMetadataAfterDelete: CollectionAfterDeleteHook =
  async ({ doc, req }) => {
    req.payload.logger.info(
      `Syncing course metadata after lesson delete: ${doc.id}`,
    );
    await syncCourseIds(req, [getId(doc.course)]);

    return doc;
  };

export const syncChapterCourseMetadataAfterChange: CollectionAfterChangeHook =
  async ({ doc, previousDoc, req }) => {
    req.payload.logger.info(
      `Syncing course metadata after chapter change: ${doc.id}`,
    );
    await syncCourseIds(req, [getId(doc.course), getId(previousDoc?.course)]);

    return doc;
  };

export const syncChapterCourseMetadataAfterDelete: CollectionAfterDeleteHook =
  async ({ doc, req }) => {
    req.payload.logger.info(
      `Syncing course metadata after chapter delete: ${doc.id}`,
    );
    await syncCourseIds(req, [getId(doc.course)]);

    return doc;
  };
