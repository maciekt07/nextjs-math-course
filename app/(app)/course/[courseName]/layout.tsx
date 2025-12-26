import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { cache } from "react";
import { auth } from "@/lib/auth/auth";
import { hasEnrollment } from "@/lib/db/enrollment";
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
    limit: 100,
    select: {
      title: true,
      slug: true,
      free: true,
      id: true,
      type: true,
      quiz: { id: true },
      video: true, //FIXME: can't select just the duration
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
    owned = await hasEnrollment(session.user.id, data.course.id);
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
