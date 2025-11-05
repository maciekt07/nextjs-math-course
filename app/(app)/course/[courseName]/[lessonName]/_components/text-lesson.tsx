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
        <div className="flex items-center text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5 h-5">
            <Clock size={18} />
            <span>{readingTime}</span>
            {/* <Separator orientation="vertical" className="self-stretch mx-2" />
            <div
              className={cn(
                "flex items-center gap-1.5 font-semibold",
                lesson.free ? "text-green-600" : "text-yellow-600",
              )}
            >
              {lesson.free ? <CheckCircle size={18} /> : <Gem size={18} />}
              <span>{lesson.free ? "Free" : "Premium"}</span>
            </div> */}
          </div>
        </div>
      </div>
      <Separator className="mb-8" />
      <MarkdownRenderer
        content={lesson!.content || "No Content"}
        unoptimized={!lesson.free}
      />

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
