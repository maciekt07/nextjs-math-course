import { MarkdownRenderer } from "@/components/markdown";
import { extractHeadings } from "@/lib/markdown/extract-headings";
import type { Lesson, Media } from "@/payload-types";
import { LessonTOC } from "../lesson-toc";

interface TextLessonProps {
  lesson: Lesson;
}

export function TextLesson({ lesson }: TextLessonProps) {
  const headings = extractHeadings(lesson.content || "");
  return (
    <div>
      <LessonTOC headings={headings} />
      <MarkdownRenderer
        content={lesson.content || "No Content"}
        media={lesson.uploadImage as Media[]}
      />
    </div>
  );
}
