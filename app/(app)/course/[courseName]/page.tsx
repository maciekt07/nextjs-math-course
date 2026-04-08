import { BookX, ChevronLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { publishedStatusWhere } from "@/cms/access/contentAccess";
import { ArrowRight } from "@/components/animate-ui/icons/arrow-right";
import { AnimateIcon } from "@/components/animate-ui/icons/icon";
import { PartyPopper } from "@/components/animate-ui/icons/party-popper";
import BuyCourseButton from "@/components/buy-course-button";
import { EmptyState, EmptyStateCenterWrapper } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { getIsDraftMode, withCache } from "@/lib/cache/withCache";
import { getCourseSeoData } from "@/lib/data/seo";
import { getPayloadClient } from "@/lib/payload-client";
import {
  buildNoIndexMetadata,
  buildPublicMetadata,
  getCourseDescription,
  getCourseSocialImage,
} from "@/lib/seo";

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
        select: { slug: true, id: true, title: true },
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ courseName: string }>;
}): Promise<Metadata> {
  const { courseName } = await params;
  const course = await getCourseSeoData(courseName);

  if (!course) {
    return buildNoIndexMetadata({
      title: "Course Not Found",
      description: "The course you are looking for does not exist.",
    });
  }

  return buildPublicMetadata({
    title: course.title,
    description: getCourseDescription(course.description, course.title),
    path: `/course/${courseName}`,
    images: [getCourseSocialImage(course.slug, course.posterAlt)],
  });
}

export default async function CoursePage({
  params: paramsPromise,
  searchParams: searchParamsPromise,
}: Args) {
  const { courseName } = await paramsPromise;
  const searchParams = await searchParamsPromise;

  const data = await getCourseWithFirstLesson(courseName);

  if (!data) notFound();

  // handle payment success or canceled params
  const hasPaymentParam = searchParams.payment_success || searchParams.canceled;
  if (hasPaymentParam) {
    const isSuccess = !!searchParams.payment_success;
    const courseTitle = data.course.title ?? "this course";

    if (isSuccess) {
      return (
        <EmptyStateCenterWrapper>
          <div className="flex flex-col items-center gap-6 text-center ">
            <div className="mx-auto flex h-24 w-24 items-center justify-center">
              <PartyPopper
                size={64}
                animate
                loop
                loopDelay={1000}
                className="text-green-600"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Payment Successful!</h1>
              <p className="mt-2 text-muted-foreground">
                You now have full access to {courseTitle}. Enjoy learning!
              </p>
            </div>
            {data.firstLesson && (
              <AnimateIcon animateOnHover className="w-full">
                <Button size="lg" className="w-full" variant="green" asChild>
                  <Link href={`/course/${courseName}/${data.firstLesson.slug}`}>
                    Start Learning <ArrowRight />
                  </Link>
                </Button>
              </AnimateIcon>
            )}
            <p className="text-sm text-muted-foreground -mt-2">
              {data.firstLesson
                ? "Or select a lesson from the sidebar to continue."
                : "Select a lesson from the sidebar to continue."}
            </p>
          </div>
        </EmptyStateCenterWrapper>
      );
    } else {
      return (
        <EmptyStateCenterWrapper>
          <div className="flex flex-col items-center gap-6 text-center">
            <div>
              <h1 className="text-2xl font-bold">Payment Canceled</h1>
              <p className="mt-2 text-muted-foreground">
                Your payment for {courseTitle} was canceled. You can try again
                anytime.
              </p>
            </div>
            <div className="flex flex-col items-center gap-2 w-full">
              <BuyCourseButton
                size="lg"
                courseId={data.course.id}
                className="w-full"
              >
                Continue Checkout
              </BuyCourseButton>
              <Button asChild size="lg" className="w-full" variant="outline">
                <Link href="/">
                  <ChevronLeft />
                  Go Back Home
                </Link>
              </Button>
            </div>
          </div>
        </EmptyStateCenterWrapper>
      );
    }
  }

  if (!data.firstLesson) {
    return (
      <EmptyStateCenterWrapper>
        <EmptyState
          icon={BookX}
          title="No Lessons Available"
          description="This course doesn't have any lessons yet."
          action={
            <Button asChild size="lg">
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

  redirect(`/course/${courseName}/${data.firstLesson.slug ?? "not-found"}`);
}
