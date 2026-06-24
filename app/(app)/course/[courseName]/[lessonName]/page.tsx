import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { publishedStatusWhere } from "@/cms/access/contentAccess";
import Footer from "@/components/footer/footer";
import { auth } from "@/lib/auth/auth";
import { getIsDraftMode, withCache } from "@/lib/cache/with-cache";
import { APP_NAME } from "@/lib/constants/site";
import { getCourseWithLessons } from "@/lib/data/course-outline";
import { hasEnrollment } from "@/lib/data/enrollment";
import { getLessonSeoData } from "@/lib/data/seo";
import { getPayloadClient } from "@/lib/payload-client";
import {
  buildNoIndexMetadata,
  buildPublicMetadata,
  getCourseDescription,
  getCourseSocialImage,
  NO_INDEX_ROBOTS,
} from "@/lib/seo";
import type { Course } from "@/types/payload-types";
import FeedbackWidget from "./_components/feedback-widget";
import { LessonLayout } from "./_components/lesson-layout";
import { LessonNavigation } from "./_components/lesson-navigation";
import {
  LockedLesson,
  type LockedLessonPreview,
} from "./_components/locked-lesson";

export const revalidate = 3600;

async function getLesson({
  courseSlug,
  lessonSlug,
}: {
  courseSlug: string;
  lessonSlug: string;
}) {
  return withCache(
    async () => {
      const payload = await getPayloadClient();
      const isDraftMode = await getIsDraftMode();

      const { docs } = await payload.find({
        collection: "lessons",
        limit: 1,
        depth: 1,
        overrideAccess: true,
        draft: isDraftMode,
        where: {
          and: [
            ...(isDraftMode ? [] : [publishedStatusWhere]),
            { "course.slug": { equals: courseSlug } },
            { slug: { equals: lessonSlug } },
          ],
        },
      });

      return docs?.[0] || null;
    },
    ["lesson", courseSlug, lessonSlug],
    {
      revalidate: 3600,
      tags: [
        `course-slug:${courseSlug}`,
        `lesson-slug:${courseSlug}:${lessonSlug}`,
      ],
    },
  )();
}

async function getLessonAccessData({
  courseSlug,
  lessonSlug,
}: {
  courseSlug: string;
  lessonSlug: string;
}) {
  return withCache(
    async () => {
      const payload = await getPayloadClient();
      const isDraftMode = await getIsDraftMode();

      const { docs } = await payload.find({
        collection: "lessons",
        limit: 1,
        depth: 0,
        overrideAccess: true,
        draft: isDraftMode,
        select: {
          title: true,
          slug: true,
          free: true,
          course: true,
        },
        where: {
          and: [
            ...(isDraftMode ? [] : [publishedStatusWhere]),
            { "course.slug": { equals: courseSlug } },
            { slug: { equals: lessonSlug } },
          ],
        },
      });

      return docs?.[0] || null;
    },
    ["lesson-access", courseSlug, lessonSlug],
    {
      revalidate: 3600,
      tags: [`course-slug:${courseSlug}`],
    },
  )();
}

function getCourseId(course: string | Course): string | null {
  return typeof course === "string" ? course : course.id;
}

export async function generateStaticParams() {
  const payload = await getPayloadClient();

  const lessons = await payload.find({
    collection: "lessons",
    overrideAccess: true,
    pagination: false,
    select: { slug: true, course: true, free: true },
    where: publishedStatusWhere,
  });

  return lessons.docs
    .filter((l) => l.free)
    .map((lesson) => ({
      courseName:
        typeof lesson.course === "string" ? "" : lesson.course?.slug || "",
      lessonName: lesson.slug,
    }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ courseName: string; lessonName: string }>;
}): Promise<Metadata> {
  const { courseName, lessonName } = await params;
  const lesson = await getLessonSeoData(courseName, lessonName);

  if (!lesson) {
    return buildNoIndexMetadata({
      title: "Lesson Not Found",
      description: "The lesson you are looking for does not exist.",
    });
  }

  return buildPublicMetadata({
    absoluteTitle: `${lesson.title} | ${lesson.course.title} | ${APP_NAME}`,
    description: getCourseDescription(
      lesson.course.description,
      lesson.course.title,
    ),
    path: `/course/${courseName}/${lessonName}`,
    images: [getCourseSocialImage(lesson.course.slug, lesson.course.posterAlt)],
    type: "article",
    robots: lesson.free ? undefined : NO_INDEX_ROBOTS,
  });
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseName: string; lessonName: string }>;
}) {
  const { courseName, lessonName } = await params;

  const lessonAccessData = await getLessonAccessData({
    courseSlug: courseName,
    lessonSlug: lessonName,
  });

  if (!lessonAccessData) notFound();

  const courseId = getCourseId(lessonAccessData.course);
  if (!courseId) notFound();

  let allowed = lessonAccessData.free;
  let showSignIn = false;
  let session = null;

  if (!allowed) {
    session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      showSignIn = true;
    } else {
      allowed = await hasEnrollment(session.user.id, courseId);
    }
  }

  if (!allowed) {
    const lockedLesson: LockedLessonPreview = {
      title: lessonAccessData.title,
      slug: lessonAccessData.slug ?? lessonName,
      courseId,
    };

    return (
      <LockedLesson
        lesson={lockedLesson}
        courseName={courseName}
        showSignIn={showSignIn}
      />
    );
  }

  const lesson = await getLesson({
    courseSlug: courseName,
    lessonSlug: lessonName,
  });

  if (!lesson) notFound();

  const courseOutline = await getCourseWithLessons(courseName);
  if (!courseOutline) notFound();

  const currentLessonIndex = courseOutline.lessons.findIndex(
    (courseLesson) => courseLesson.slug === lesson.slug,
  );
  const previousLesson =
    currentLessonIndex > 0
      ? courseOutline.lessons[currentLessonIndex - 1]
      : null;
  const nextLesson =
    currentLessonIndex >= 0 &&
    currentLessonIndex < courseOutline.lessons.length - 1
      ? courseOutline.lessons[currentLessonIndex + 1]
      : null;

  return (
    <div className="min-h-screen flex flex-col">
      <div className="grow">
        <LessonLayout lesson={lesson}>
          <FeedbackWidget lessonId={lesson.id} type={lesson.type} />
          <LessonNavigation
            courseSlug={courseName}
            previousLesson={previousLesson}
            nextLesson={nextLesson}
          />
        </LessonLayout>
      </div>
      <Footer />
    </div>
  );
}
