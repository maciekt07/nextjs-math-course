import { MarkdownRenderer } from "@/components/markdown";
import { extractHeadings } from "@/lib/markdown/extract-headings";
import type { Lesson } from "@/types/payload-types";
import { LessonTOC } from "../lesson-toc";

interface TextLessonProps {
  lesson: Lesson;
}

export function TextLesson({ lesson }: TextLessonProps) {
  const headings = extractHeadings(lesson.content);

  return (
    <div className="-mt-4">
      {headings.length > 0 && <LessonTOC headings={headings} />}
      <MarkdownRenderer
        content={lesson.content ?? "No Content"}
        media={lesson.uploadImage}
        // don't optimize free lessons for better SEO
        // there are no performance issues since they are SSGed
        optimizeMath={!lesson.free || process.env.NODE_ENV === "development"}
        isFreeLesson={lesson.free ?? false}
        useSections
      />
    </div>
  );
}
