import { BookX } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { getPayloadClient } from "@/lib/payload-client";

const getCourse = cache(async (courseSlug: string) => {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "courses",
    where: { slug: { equals: courseSlug } },
    limit: 1,
  });
  return docs[0] || null;
});

const getFirstLesson = cache(async (courseId: string) => {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "lessons",
    where: { course: { equals: courseId } },
    sort: "order",
    limit: 1,
  });
  return docs[0] || null;
});

type Args = {
  params: Promise<{ courseName: string }>;
};

export default async function CoursePage({ params: paramsPromise }: Args) {
  const { courseName } = await paramsPromise;
  const course = await getCourse(courseName);

  if (!course) notFound();

  const firstLesson = await getFirstLesson(course.id);

  if (!firstLesson) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="flex items-center gap-4 flex-col">
            <BookX size={64} className="text-primary" />
            <h1 className="text-2xl font-bold mb-2">No Lessons Available</h1>
          </div>
          <p className="text-muted-foreground">
            This course doesn't have any lessons yet.
          </p>
        </div>
      </div>
    );
  }

  redirect(`/course/${courseName}/${firstLesson.slug}`);
}
