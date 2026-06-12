import { notFound } from "next/navigation";
import { getServerSession } from "@/lib/auth/get-session";
import { getCourseWithLessons } from "@/lib/data/course-outline";
import { hasEnrollment } from "@/lib/data/enrollment";
import { CourseLayoutWrapper } from "./_components/course-layout-wrapper";

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
  const session = await getServerSession();
  if (session) {
    owned = await hasEnrollment(session.user.id, data.course.id);
  }

  return (
    <CourseLayoutWrapper
      course={data.course}
      lessons={data.lessons}
      chapters={data.chapters}
      owned={owned}
    >
      {children}
    </CourseLayoutWrapper>
  );
}
