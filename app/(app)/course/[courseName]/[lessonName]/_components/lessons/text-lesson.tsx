import { MarkdownRenderer } from "@/components/markdown-renderer";
import type { Lesson } from "@/payload-types";

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

  return (
    <MarkdownRenderer
      content={lesson.content || "No Content"}
      unoptimized={!lesson.free}
      media={media}
    />
  );
}
