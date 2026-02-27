import { BookOpen } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { Compass } from "@/components/animate-ui/icons/compass";
import { AnimateIcon } from "@/components/animate-ui/icons/icon";
import { CourseCard } from "@/components/course-card";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth/auth";
import { getCoursesByIds, getOwnedCourseIds } from "@/lib/data/courses";

export const metadata = {
  title: "Your Courses",
};

export default async function CoursesPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const ids = await getOwnedCourseIds(session.user.id);

  if (ids.length === 0) {
    return <EmptyState title="No courses yet" />;
  }

  const courses = await getCoursesByIds(ids);

  if (courses.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="No courses yet"
        description="Start learning by exploring available courses. Once you purchase one, it will appear here in your library."
        action={
          <AnimateIcon animateOnHover>
            <Button asChild size="xl">
              <Link href="/#courses">
                <Compass className="size-5" />
                Explore Courses
              </Link>
            </Button>
          </AnimateIcon>
        }
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto pt-0 p-5 flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Your Courses</h1>

      <div className="grid gap-6">
        {courses.map((c) => (
          <CourseCard
            key={c.id}
            course={c}
            owned={true}
            customContent={
              <Button asChild size="lg" className="w-full">
                <Link prefetch href={`/course/${c.slug}`}>
                  Open
                </Link>
              </Button>
            }
          />
        ))}
      </div>
    </div>
  );
}
