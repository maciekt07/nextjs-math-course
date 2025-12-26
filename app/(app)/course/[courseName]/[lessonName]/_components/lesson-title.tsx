import { Calendar, CheckCircle, Clock, Film, Gem, List } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDuration, formatReadingTime } from "@/lib/format";
import { cn } from "@/lib/ui";
import type { Lesson, MuxVideo } from "@/payload-types";

interface LessonTitleProps {
  lesson: Lesson | null;
}

export function LessonTitle({ lesson }: LessonTitleProps) {
  if (!lesson) return null;

  const metadata = getLessonMetadata(lesson);

  const createdAt = new Date(lesson.createdAt);
  const updatedAt = new Date(lesson.updatedAt);

  const formattedDate = new Intl.DateTimeFormat(navigator.language, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(createdAt);

  const fullCreatedAt = new Intl.DateTimeFormat(navigator.language, {
    dateStyle: "full",
    timeStyle: "short",
  }).format(createdAt);

  const fullUpdatedAt = new Intl.DateTimeFormat(navigator.language, {
    dateStyle: "full",
    timeStyle: "short",
  }).format(updatedAt);

  return (
    <div className="mb-8 font-inter">
      <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-primary">
        {lesson.title}
      </h1>

      <div className="flex items-center text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5 h-5">
          {metadata && (
            <>
              <metadata.icon size={18} />
              <span>{metadata.text}</span>
              <Separator orientation="vertical" className="self-stretch mx-2" />
            </>
          )}

          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 cursor-default">
                  <Calendar size={18} />
                  <span>{formattedDate}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs space-y-1">
                <div>
                  <span className="font-medium">Created:</span> {fullCreatedAt}
                </div>
                <div>
                  <span className="font-medium">Updated:</span> {fullUpdatedAt}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Separator orientation="vertical" className="self-stretch mx-2" />

          <div
            className={cn(
              "flex items-center gap-1.5 font-semibold",
              lesson.free ? "text-green-600" : "text-yellow-600",
            )}
          >
            {lesson.free ? <CheckCircle size={18} /> : <Gem size={18} />}
            <span>{lesson.free ? "Free" : "Premium"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function getLessonMetadata(lesson: Lesson) {
  switch (lesson.type) {
    case "text": {
      const readingTime = formatReadingTime(lesson.readingTimeSeconds || 0);
      return readingTime ? { icon: Clock, text: readingTime } : null;
    }
    case "video": {
      const duration = (lesson.video as MuxVideo)?.duration;
      return duration ? { icon: Film, text: formatDuration(duration) } : null;
    }
    case "quiz": {
      const count = lesson.quiz?.length ?? 0;
      return count > 0
        ? {
            icon: List,
            text: `${count} ${count === 1 ? "question" : "questions"}`,
          }
        : null;
    }
    default:
      return null;
  }
}
