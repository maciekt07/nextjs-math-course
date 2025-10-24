import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { cache } from "react";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { getPayloadClient } from "@/lib/payload-client";

export const revalidate = 3600;

const queryLessonBySlug = cache(
  async ({
    courseSlug,
    lessonSlug,
    draft,
  }: {
    courseSlug: string;
    lessonSlug: string;
    draft: boolean;
  }) => {
    const payload = await getPayloadClient();
    const { docs } = await payload.find({
      collection: "lessons",
      draft,
      limit: 1,
      depth: 1,
      where: {
        and: [
          { "course.slug": { equals: courseSlug } },
          { slug: { equals: lessonSlug } },
        ],
      },
    });
    return docs?.[0] || null;
  },
);

type Args = {
  params: Promise<{ courseName: string; lessonName: string }>;
};

export async function generateStaticParams() {
  const payload = await getPayloadClient();
  const lessons = await payload.find({
    collection: "lessons",
    limit: 1000,
    pagination: false,
    select: { slug: true, course: true },
  });

  return lessons.docs.map((lesson) => ({
    courseName: typeof lesson.course === "string" ? "" : lesson.course.slug,
    lessonName: lesson.slug,
  }));
}

export default async function LessonPage({ params: paramsPromise }: Args) {
  const { courseName, lessonName } = await paramsPromise;
  const { isEnabled: draft } = await draftMode();

  const lesson = await queryLessonBySlug({
    courseSlug: courseName,
    lessonSlug: lessonName,
    draft,
  });

  if (!lesson) notFound();

  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <article className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-primary">{lesson.title}</h1>
      </div>

      <MarkdownRenderer content={lesson.content} />

      <div className="mt-8 text-sm text-gray-500 dark:text-gray-400 flex flex-col gap-2">
        <span>Created: {dateFormatter.format(new Date(lesson.createdAt))}</span>
        <span>Updated: {dateFormatter.format(new Date(lesson.updatedAt))}</span>
      </div>
    </article>
  );
}
