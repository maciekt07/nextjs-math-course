import { BookOpen } from "lucide-react";
import Link from "next/link";
import { Compass } from "@/components/animate-ui/icons/compass";
import { AnimateIcon } from "@/components/animate-ui/icons/icon";
import { CourseCard } from "@/components/course-card";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { getServerSession } from "@/lib/auth/get-session";
import { getCoursesByIds, getOwnedCourseIds } from "@/lib/data/courses";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata = buildNoIndexMetadata({
  title: "Your Courses",
  description: "Browse and open the courses you have already purchased.",
});

export default async function CoursesPage() {
  const session = await getServerSession();
  if (!session) return null;

  const ids = await getOwnedCourseIds(session.user.id);
  const courses = await getCoursesByIds(ids);

  if (courses.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="No courses yet"
        description="Start learning by exploring available courses. Once you purchase one, it will appear here in your library."
        className="mb-24"
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
                <Link
                  prefetch
                  href={
                    c.slug && c.firstLessonSlug
                      ? `/course/${c.slug}/${c.firstLessonSlug}`
                      : `/course/${c.slug}`
                  }
                >
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
