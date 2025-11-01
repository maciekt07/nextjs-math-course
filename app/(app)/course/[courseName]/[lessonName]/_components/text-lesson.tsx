import { Clock } from "lucide-react";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { Separator } from "@/components/ui/separator";
import type { Lesson } from "@/payload-types";
import { getReadingTime } from "@/utils/getReadingTime";

interface TextLessonProps {
  lesson: Lesson;
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function TextLesson({ lesson }: TextLessonProps) {
  const readingTime = getReadingTime(lesson!.content || "");

  return (
    <>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 text-primary">
          {lesson!.title}
        </h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            <span>{readingTime}</span>
          </div>
        </div>
      </div>
      <Separator className="mb-8" />
      <MarkdownRenderer content={lesson!.content || "No Content"} />

      <div className="mt-8 text-sm text-gray-500 dark:text-gray-400 flex flex-col gap-2">
        <span>
          Created: {dateFormatter.format(new Date(lesson!.createdAt))}
        </span>
        <span>
          Updated: {dateFormatter.format(new Date(lesson!.updatedAt))}
        </span>
      </div>
    </>
  );
}
