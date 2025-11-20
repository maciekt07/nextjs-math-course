import { MarkdownRenderer } from "@/components/markdown-renderer";
import { extractHeadings } from "@/lib/markdown/extract-headings";
import type { Lesson } from "@/payload-types";
import { LessonTOC } from "../lesson-toc";

interface TextLessonProps {
  lesson: Lesson;
}

export function TextLesson({ lesson }: TextLessonProps) {
  const media =
    Array.isArray(lesson.uploadImage) && lesson.uploadImage.length > 0
      ? lesson.uploadImage.map((img) =>
          typeof img === "string"
            ? { url: img }
            : {
                url: img.url,
                blurhash: img.blurhash,
                width: img.width,
                height: img.height,
              },
        )
      : [];
  const headings = extractHeadings(lesson.content || "");
  return (
    <div>
      <LessonTOC headings={headings} />
      <MarkdownRenderer
        content={lesson.content || "No Content"}
        unoptimized={!lesson.free}
        media={media}
      />
    </div>
  );
}
