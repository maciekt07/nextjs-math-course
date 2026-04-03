import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { publishedStatusWhere } from "@/cms/access/contentAccess";
import { AnimateIcon } from "@/components/animate-ui/icons/icon";
import { Lock } from "@/components/animate-ui/icons/lock";
import { LogIn } from "@/components/animate-ui/icons/log-in";
import BuyCourseButton from "@/components/buy-course-button";
import { EmptyStateCenterWrapper } from "@/components/empty-state";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth/auth";
import { getIsDraftMode, withCache } from "@/lib/cache/withCache";
import { hasEnrollment } from "@/lib/data/enrollment";
import { getLessonSeoData } from "@/lib/data/seo";
import { getPayloadClient } from "@/lib/payload-client";
import {
  APP_NAME,
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

export const revalidate = 3600;

async function getLesson({
  courseSlug,
  lessonSlug,
}: {
  courseSlug: string;
  lessonSlug: string;
}) {
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

  const lesson = docs?.[0] || null;

  return withCache(async () => lesson, ["lesson", courseSlug, lessonSlug], {
    revalidate: 3600,
    tags: lesson
      ? [`lesson:${lesson.id}`, `course-slug:${courseSlug}`]
      : [`course-slug:${courseSlug}`],
  })();
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

  const lesson = await getLesson({
    courseSlug: courseName,
    lessonSlug: lessonName,
  });

  if (!lesson) notFound();

  let allowed = lesson.free;
  let showSignIn = false;
  let session = null;

  if (!allowed) {
    session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      showSignIn = true;
    } else {
      const courseId =
        typeof lesson.course === "string"
          ? lesson.course
          : (lesson.course as Course).id;

      allowed = await hasEnrollment(session.user.id, courseId);
    }
  }

  if (!allowed) {
    return (
      <EmptyStateCenterWrapper>
        <div className="flex flex-col items-center text-center space-y-6 max-w-130">
          <div className="mx-auto w-24 h-24 flex items-center justify-center bg-orange-600/10 dark:bg-orange-500/10 rounded-full">
            <AnimateIcon animate animation="path">
              <Lock
                size={48}
                className="text-orange-600 dark:text-orange-500"
              />
            </AnimateIcon>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">{lesson.title}</h1>
            <h2 className="text-muted-foreground">
              This is a premium lesson. You need to own a full course to access
              it.
            </h2>
          </div>
          {showSignIn ? (
            <AnimateIcon animateOnHover className="w-full">
              <Button size="lg" className="w-full" asChild>
                <Link
                  href={{
                    pathname: "/auth/sign-in",
                    query: {
                      returnTo: `/course/${courseName}/${lesson.slug}`,
                    },
                  }}
                >
                  <LogIn className="h-4 w-4" />
                  Sign in to continue
                </Link>
              </Button>
            </AnimateIcon>
          ) : (
            <BuyCourseButton
              courseId={
                typeof lesson.course === "string"
                  ? lesson.course
                  : (lesson.course as Course).id
              }
              size="lg"
              className="w-full"
            >
              Buy course
            </BuyCourseButton>
          )}
        </div>
      </EmptyStateCenterWrapper>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="grow">
        <LessonLayout lesson={lesson}>
          <FeedbackWidget lessonId={lesson.id} type={lesson.type} />
          {/* FIXME: CLS */}
          <LessonNavigation currentSlug={lesson.slug} />
        </LessonLayout>
      </div>
      <Footer />
    </div>
  );
}
