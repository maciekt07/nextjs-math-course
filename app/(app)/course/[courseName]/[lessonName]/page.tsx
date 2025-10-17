import { FileText } from "lucide-react";
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

  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const createdAt = dateFormatter.format(new Date(lesson.createdAt));
  const updatedAt = dateFormatter.format(new Date(lesson.updatedAt));

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-primary flex items-center gap-3">
          <FileText /> {lesson.title}
        </h1>
      </div>

      <div className="prose dark:prose-invert max-w-none marker:text-primary">
        <MarkdownRenderer content={lesson.content} />
      </div>
      <div className="mt-8 text-sm text-gray-500 dark:text-gray-400 flex flex-col gap-2">
        <span>Created: {createdAt}</span>
        <span>Updated: {updatedAt}</span>
      </div>
    </div>
  );
}
