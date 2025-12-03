import { BookX } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { getPayloadClient } from "@/lib/payload-client";

const getCourseWithFirstLesson = cache(async (courseSlug: string) => {
  const payload = await getPayloadClient();

  const { docs: courses } = await payload.find({
    collection: "courses",
    where: { slug: { equals: courseSlug } },
    select: { slug: true },
    limit: 1,
  });

  const course = courses[0];
  if (!course) return null;

  const { docs: lessons } = await payload.find({
    collection: "lessons",
    where: { course: { equals: course.id } },
    sort: "order",
    limit: 1,
    select: {
      slug: true,
    },
  });

  return { course, firstLesson: lessons[0] || null };
});

type Args = {
  params: Promise<{ courseName: string }>;
};

export default async function CoursePage({ params: paramsPromise }: Args) {
  const { courseName } = await paramsPromise;
  const data = await getCourseWithFirstLesson(courseName);

  if (!data) notFound();

  if (!data.firstLesson) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="mx-auto mb-4 w-24 h-24 flex items-center justify-center bg-primary/10 rounded-full">
            <BookX size={48} className="text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">No Lessons Available</h1>
          <p className="text-muted-foreground">
            This course doesn't have any lessons yet.
          </p>
        </div>
      </div>
    );
  }

  redirect(`/course/${courseName}/${data.firstLesson.slug}`);
}
