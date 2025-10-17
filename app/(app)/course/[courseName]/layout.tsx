import { notFound } from "next/navigation";
import { cache } from "react";
import { ThemeSelect } from "@/components/theme-select";
import { getPayloadClient } from "@/lib/payload-client";
import { CourseSidebar } from "../_components/course-sidebar";

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

  return (
    <div className="flex h-screen overflow-hidden relative">
      <div className="absolute top-6 right-6 z-10">
        <ThemeSelect />
      </div>

      <CourseSidebar
        course={data.course}
        lessons={data.lessons}
        courseName={courseName}
      />

      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
