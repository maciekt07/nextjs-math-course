import { notFound } from "next/navigation";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { getPayloadClient } from "@/lib/payload-client";

async function getLesson(courseSlug: string, lessonSlug: string) {
  const payload = await getPayloadClient();

  const courses = await payload.find({
    collection: "courses",
    where: { slug: { equals: courseSlug } },
    limit: 1,
  });

  if (courses.docs.length === 0) return null;

  const lessons = await payload.find({
    collection: "lessons",
    where: {
      and: [
        { course: { equals: courses.docs[0].id } },
        { slug: { equals: lessonSlug } },
      ],
    },
    limit: 1,
  });

  if (lessons.docs.length === 0) return null;
  return { course: courses.docs[0], lesson: lessons.docs[0] };
}

export default async function LessonPage({
  params,
}: {
  params: { courseName: string; lessonName: string };
}) {
  const { courseName, lessonName } = await params;

  const data = await getLesson(courseName, lessonName);

  if (!data) notFound();

  const { lesson } = data;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{lesson.title}</h1>
      </div>

      <div className="prose prose-slate dark:prose-invert max-w-none">
        <MarkdownRenderer content={lesson.content} />
      </div>
    </div>
  );
}
