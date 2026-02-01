import { BookX, ChevronLeft } from "lucide-react";
import { unstable_cache } from "next/cache";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { EmptyState, EmptyStateCenterWrapper } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { getPayloadClient } from "@/lib/payload-client";

export const revalidate = 3600;

const getCourseWithFirstLesson = unstable_cache(
  async (courseSlug: string) => {
    const payload = await getPayloadClient();

    const { docs: courses } = await payload.find({
      collection: "courses",
      where: { slug: { equals: courseSlug } },
      select: { slug: true, id: true },
      limit: 1,
    });

    const course = courses[0];
    if (!course) return null;

    const { docs: lessons } = await payload.find({
      collection: "lessons",
      where: { course: { equals: course.id } },
      select: { slug: true },
      limit: 1,
    });

    return { course, firstLesson: lessons[0] || null };
  },
  [],
  {
    tags: ["courses-list"],
    revalidate: 3600,
  },
);

type Args = {
  params: Promise<{ courseName: string }>;
};

export default async function CoursePage({ params: paramsPromise }: Args) {
  const { courseName } = await paramsPromise;
  const data = await getCourseWithFirstLesson(courseName);

  if (!data) notFound();

  if (!data.firstLesson) {
    return (
      <EmptyStateCenterWrapper>
        <EmptyState
          icon={BookX}
          title="No Lessons Available"
          description="This course doesn't have any lessons yet."
          action={
            <Button asChild size="xl">
              <Link href="/">
                <ChevronLeft />
                Go Back Home
              </Link>
            </Button>
          }
        />
      </EmptyStateCenterWrapper>
    );
  }

  redirect(`/course/${courseName}/${data.firstLesson.slug}`);
}
