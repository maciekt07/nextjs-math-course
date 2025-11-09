import { and, eq } from "drizzle-orm";
import { Lock, LogIn } from "lucide-react";
import type { Metadata } from "next";
import { draftMode, headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import BuyCourseButton from "@/components/buy-course-button";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { db } from "@/drizzle/db";
import { enrollment } from "@/drizzle/schema";
import { auth } from "@/lib/auth";
import { getPayloadClient } from "@/lib/payload-client";
import { cn } from "@/lib/utils";
import type { Course } from "@/payload-types";
import { LessonTitle } from "./_components/lesson-title";
import { QuizLesson } from "./_components/lessons/quiz-lesson";
import { TextLesson } from "./_components/lessons/text-lesson";
import { VideoLesson } from "./_components/lessons/video-lesson";

export const revalidate = 3600;
export const dynamic = "force-dynamic";

const queryLessonBySlug = cache(
  async ({
    courseSlug,
    lessonSlug,
    draft,
  }: {
    courseSlug: string;
    lessonSlug: string;
    draft: boolean;
  }) => {
    const payload = await getPayloadClient();
    const { docs } = await payload.find({
      collection: "lessons",
      draft,
      limit: 1,
      depth: 1,
      where: {
        and: [
          { "course.slug": { equals: courseSlug } },
          { slug: { equals: lessonSlug } },
        ],
      },
    });
    return docs?.[0] || null;
  },
);

type Args = {
  params: Promise<{ courseName: string; lessonName: string }>;
};

export async function generateStaticParams() {
  const payload = await getPayloadClient();
  const lessons = await payload.find({
    collection: "lessons",
    limit: 1000,
    pagination: false,
    select: { slug: true, course: true, free: true },
  });

  return lessons.docs
    .filter((l) => l.free)
    .map((lesson) => ({
      courseName: typeof lesson.course === "string" ? "" : lesson.course.slug,
      lessonName: lesson.slug,
    }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ courseName: string; lessonName: string }>;
}): Promise<Metadata> {
  const { courseName, lessonName } = await params;
  const payload = await getPayloadClient();

  const { docs } = await payload.find({
    collection: "lessons",
    limit: 1,
    where: {
      and: [
        { "course.slug": { equals: courseName } },
        { slug: { equals: lessonName } },
      ],
    },
    select: { title: true, course: true },
  });

  const lesson = docs?.[0];
  if (!lesson) {
    return { title: "Lesson not found | Math Course" };
  }

  const courseTitle =
    typeof lesson.course === "string"
      ? ""
      : (lesson.course as { title?: string }).title || "";

  return {
    title: `${lesson.title}${courseTitle ? ` | ${courseTitle}` : ""} | Math Course Online`,
  };
}

export default async function LessonPage({ params: paramsPromise }: Args) {
  const { courseName, lessonName } = await paramsPromise;
  const { isEnabled: draft } = await draftMode();
  const payload = await getPayloadClient();

  const lessons = await payload.find({
    collection: "lessons",
    limit: 1,
    draft,
    where: {
      and: [
        { "course.slug": { equals: courseName } },
        { slug: { equals: lessonName } },
      ],
    },
    select: {
      slug: true,
      course: true,
      free: true,
      title: true,
    },
  });

  const lessonMeta = lessons.docs?.[0];
  if (!lessonMeta) notFound();

  let allowed = lessonMeta.free;
  let showSignIn = false;

  if (!allowed) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      showSignIn = true;
    } else {
      const userId = session.user.id;
      const courseId =
        typeof lessonMeta.course === "string"
          ? lessonMeta.course
          : (lessonMeta.course as Course).id;

      const rows = await db
        .select()
        .from(enrollment)
        .where(
          and(
            eq(enrollment.userId, userId),
            eq(enrollment.courseId, courseId),
            eq(enrollment.status, "completed"),
          ),
        );

      if (rows.length > 0) allowed = true;
    }
  }

  let lesson = null;
  if (allowed) {
    lesson = await queryLessonBySlug({
      courseSlug: courseName,
      lessonSlug: lessonName,
      draft,
    });
  }

  if (!lesson && allowed) notFound();

  if (!allowed) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md text-center p-8">
          <CardContent className="space-y-4">
            <Lock className="mx-auto w-12 h-12 text-orange-600 dark:text-orange-500" />
            <h2 className="text-2xl font-semibold">{lessonMeta.title}</h2>
            <p className="text-muted-foreground">
              This is a premium lesson. To access it you need to own the course.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-3 mt-4">
              {showSignIn ? (
                <Button size="lg" asChild>
                  <Link
                    href={`/auth/sign-in?returnTo=${encodeURIComponent(
                      `/course/${
                        typeof lessonMeta.course === "string"
                          ? lessonMeta.course
                          : lessonMeta.course.slug
                      }/${lessonMeta.slug}`,
                    )}`}
                  >
                    <LogIn /> Sign in to continue
                  </Link>
                </Button>
              ) : (
                <BuyCourseButton
                  courseId={
                    typeof lessonMeta.course === "string"
                      ? lessonMeta.course
                      : (lessonMeta.course as Course).id
                  }
                  size="lg"
                >
                  Buy course
                </BuyCourseButton>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow">
        <article
          className={cn(
            "mx-auto py-8 mt-10 px-6",
            lesson?.type === "video" ? "max-w-6xl" : "max-w-4xl",
          )}
        >
          <LessonTitle lesson={lesson} />
          <Separator className="mb-8" />
          {lesson?.type === "text" && <TextLesson lesson={lesson} />}
          {lesson?.type === "quiz" && <QuizLesson lesson={lesson} />}
          {lesson?.type === "video" && <VideoLesson lesson={lesson} />}
        </article>
      </div>

      <Footer />
    </div>
  );
}
