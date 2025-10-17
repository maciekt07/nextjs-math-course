import { notFound } from "next/navigation";
import { ThemeSelect } from "@/components/theme-select";
import { getPayloadClient } from "@/lib/payload-client";
import { CourseSidebar } from "../_components/course-sidebar";

async function getCourseWithLessons(courseSlug: string) {
  const payload = await getPayloadClient();

  const courses = await payload.find({
    collection: "courses",
    where: { slug: { equals: courseSlug } },
    limit: 1,
  });

  if (courses.docs.length === 0) return null;

  const course = courses.docs[0];
  const lessons = await payload.find({
    collection: "lessons",
    where: { course: { equals: course.id } },
    sort: "order",
    limit: 100,
  });

  return { course, lessons: lessons.docs };
}

export default async function CourseLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { courseName: string };
}) {
  const { courseName } = params;
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
        courseName={params.courseName}
      />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
