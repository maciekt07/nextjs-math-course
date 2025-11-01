import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ThemeSelect } from "@/components/theme-select";
import { db } from "@/drizzle/db";
import { enrollment } from "@/drizzle/schema";
import { auth } from "@/lib/auth";
import { getPayloadClient } from "@/lib/payload-client";
import { CourseSidebar } from "./_components/course-sidebar";

const getCourseWithLessons = cache(async (courseSlug: string) => {
  const payload = await getPayloadClient();

  const { docs: courseDocs } = await payload.find({
    collection: "courses",
    where: { slug: { equals: courseSlug } },
    limit: 1,
  });

  if (!courseDocs.length) return null;

  const course = courseDocs[0];

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
    <div className="flex h-screen overflow-hidden relative">
      <div className="absolute top-6 right-6 z-10">
        <ThemeSelect />
      </div>

      <CourseSidebar
        course={data.course}
        lessons={data.lessons}
        owned={owned}
      />

      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
