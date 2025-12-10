import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { cache } from "react";
import { db } from "@/drizzle/db";
import { enrollment } from "@/drizzle/schema";
import { auth } from "@/lib/auth";
import { getPayloadClient } from "@/lib/payload-client";
import { CourseLayoutWrapper } from "./_components/course-layout-wrapper";

const getCourseWithLessons = cache(async (courseSlug: string) => {
  const payload = await getPayloadClient();

  const { docs: courseDocs } = await payload.find({
    collection: "courses",
    where: { slug: { equals: courseSlug } },
    limit: 1,
  });

  if (!courseDocs.length) return null;

  const course = courseDocs[0];

  //FIXME: use partial type
  const { docs: lessons } = await payload.find({
    collection: "lessons",
    where: { course: { equals: course.id } },
    sort: "order",
    limit: 100,
    select: {
      title: true,
      slug: true,
      free: true,
      id: true,
      order: true,
      type: true,
      quiz: { id: true }, // get number of quizes
      video: true, // can't select just the duration
      readingTimeSeconds: true,
    },
  });

  return { course, lessons };
});

type Args = {
  params: Promise<{ courseName: string }>;
  children: React.ReactNode;
};

export default async function CourseLayout({
  params: paramsPromise,
  children,
}: Args) {
  const { courseName } = await paramsPromise;
  const data = await getCourseWithLessons(courseName);

  if (!data) notFound();

  // determine whether the current user owns this course
  let owned = false;
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) {
    const rows = await db
      .select()
      .from(enrollment)
      .where(
        and(
          eq(enrollment.userId, session.user.id),
          eq(enrollment.courseId, data.course.id),
          eq(enrollment.status, "completed"),
        ),
      );
    owned = (rows || []).length > 0;
  }

  return (
    <CourseLayoutWrapper
      course={data.course}
      lessons={data.lessons}
      owned={owned}
    >
      {children}
    </CourseLayoutWrapper>
  );
}
