import { and, eq } from "drizzle-orm";
import { Lock, LogIn } from "lucide-react";
import type { Metadata } from "next";
import { unstable_cache } from "next/cache";

import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import FeedbackWidget from "@/app/(app)/course/[courseName]/[lessonName]/_components/feedback-widget";
import BuyCourseButton from "@/components/buy-course-button";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/drizzle/db";
import { enrollment } from "@/drizzle/schema";
import { auth } from "@/lib/auth/auth";
import { getPayloadClient } from "@/lib/payload-client";
import type { Course } from "@/payload-types";
import { LessonContentWrapper } from "./_components/lesson-content-wrapper";
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

  const { docs } = await payload.find({
    collection: "lessons",
    limit: 1,
    depth: 1,
    where: {
      and: [
        { "course.slug": { equals: courseSlug } },
        { slug: { equals: lessonSlug } },
      ],
    },
  });

  const lesson = docs?.[0] || null;

  return unstable_cache(
    async () => lesson,
    ["lesson", courseSlug, lessonSlug],
    {
      revalidate: 3600,
      tags: lesson ? [`lesson:${lesson.id}`] : [],
    },
  )();
}

function hasEnrollment(userId: string, courseId: string) {
  return unstable_cache(
    async () => {
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

      return rows.length > 0;
    },
    ["enrollment", userId, courseId],
    {
      revalidate: 300,
      tags: [`enrollment:${userId}:${courseId}`],
    },
  )();
}

export async function generateStaticParams() {
  const payload = await getPayloadClient();

  const lessons = await payload.find({
    collection: "lessons",
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
  if (!lesson) return { title: "Lesson not found" };

  const courseTitle =
    typeof lesson.course === "string" ? "" : lesson.course.title;

  return {
    title: `${lesson.title}${courseTitle ? ` | ${courseTitle}` : ""}`,
  };
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
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-[400px] text-center p-8">
          <CardContent className="space-y-4">
            <Lock className="mx-auto w-12 h-12 text-orange-600 dark:text-orange-500" />
            <h2 className="text-2xl font-semibold">{lesson.title}</h2>
            <p className="text-muted-foreground">
              This is a premium lesson. You need to own the course.
            </p>

            <div className="flex justify-center gap-3 mt-4">
              {showSignIn ? (
                <Button size="lg" asChild>
                  <Link
                    href={{
                      pathname: "/auth/sign-in",
                      query: {
                        returnTo: `/course/${courseName}/${lesson.slug}`,
                      },
                    }}
                  >
                    <LogIn /> Sign in
                  </Link>
                </Button>
              ) : (
                <BuyCourseButton
                  courseId={
                    typeof lesson.course === "string"
                      ? lesson.course
                      : (lesson.course as Course).id
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
        <LessonContentWrapper lesson={lesson}>
          <FeedbackWidget lessonId={lesson.id} type={lesson.type} />
          <LessonNavigation currentSlug={lesson.slug} />
        </LessonContentWrapper>
      </div>
      <Footer />
    </div>
  );
}
