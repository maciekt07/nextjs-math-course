import { BookX } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { getPayloadClient } from "@/lib/payload-client";

export default async function CoursePage({
  params,
}: {
  params: { courseName: string };
}) {
  const payload = await getPayloadClient();

  const courses = await payload.find({
    collection: "courses",
    where: { slug: { equals: params.courseName } },
    limit: 1,
  });

  if (courses.docs.length === 0) notFound();

  const lessons = await payload.find({
    collection: "lessons",
    where: { course: { equals: courses.docs[0].id } },
    sort: "order",
    limit: 1,
  });

  if (lessons.docs.length === 0) {
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

  redirect(`/course/${params.courseName}/${lessons.docs[0].slug}`);
}
