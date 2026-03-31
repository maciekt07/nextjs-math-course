import { BookX, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { publishedStatusWhere } from "@/cms/access/contentAccess";
import { EmptyState, EmptyStateCenterWrapper } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { getIsDraftMode, withCache } from "@/lib/cache/withCache";
import { getPayloadClient } from "@/lib/payload-client";

// fallback page - not actively used in normal flow

const getCourseWithFirstLesson = (courseSlug: string) =>
  withCache(
    async () => {
      const payload = await getPayloadClient();
      const isDraftMode = await getIsDraftMode();

      const { docs: courses } = await payload.find({
        collection: "courses",
        overrideAccess: true,
        draft: isDraftMode,
        where: {
          and: [
            ...(isDraftMode ? [] : [publishedStatusWhere]),
            { slug: { equals: courseSlug } },
          ],
        },
        select: { slug: true, id: true },
        limit: 1,
      });

      const course = courses[0];
      if (!course) return null;

      const { docs: lessons } = await payload.find({
        collection: "lessons",
        overrideAccess: true,
        draft: isDraftMode,
        where: {
          and: [
            ...(isDraftMode ? [] : [publishedStatusWhere]),
            { course: { equals: course.id } },
          ],
        },
        select: { slug: true },
        limit: 1,
      });

      return { course, firstLesson: lessons[0] ?? null };
    },
    ["course-first-lesson", courseSlug],
    {
      revalidate: 3600,
      tags: [`course-slug:${courseSlug}`],
    },
  )();

export async function generateStaticParams() {
  const payload = await getPayloadClient();
  const { docs: courses } = await payload.find({
    collection: "courses",
    overrideAccess: true,
    select: { slug: true },
    limit: 1000,
    where: publishedStatusWhere,
  });
  return courses.map((c) => ({ courseName: c.slug }));
}

type Args = {
  params: Promise<{ courseName: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function CoursePage({
  params: paramsPromise,
  searchParams: searchParamsPromise,
}: Args) {
  const { courseName } = await paramsPromise;
  const searchParams = await searchParamsPromise;

  if (searchParams?.session_id) {
    redirect(
      `/api/stripe/checkout-success?session_id=${searchParams.session_id}`,
    );
  }

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
