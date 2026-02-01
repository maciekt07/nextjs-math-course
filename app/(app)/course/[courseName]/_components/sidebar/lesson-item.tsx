"use client";

import { Calculator, FileText, Lock, Video } from "lucide-react";
import Link from "next/link";
import { memo } from "react";
import { formatDuration, formatReadingTime } from "@/lib/format";
import { cn } from "@/lib/ui";
import type { Lesson } from "@/payload-types";

const lessonTypeConfig = {
  quiz: {
    icon: Calculator,
    color: {
      base: "bg-red-500/10 text-red-600 dark:text-red-500",
      hover: "group-hover:bg-red-500/20",
    },
  },
  video: {
    icon: Video,
    color: {
      base: "bg-green-500/10 text-green-600 dark:text-green-400",
      hover: "group-hover:bg-green-500/20",
    },
  },
  default: {
    icon: FileText,
    color: {
      base: "bg-primary/10 text-primary",
      hover: "group-hover:bg-primary/20",
    },
  },
};

interface LessonItemProps {
  lesson: Lesson;
  courseSlug: string;
  isActive: boolean;
  owned?: boolean;
  onClick: (e: React.MouseEvent<HTMLAnchorElement>, lessonPath: string) => void;
}

export const LessonItem = memo(
  ({ lesson, courseSlug, isActive, owned, onClick }: LessonItemProps) => {
    const lessonPath = `/course/${courseSlug}/${lesson.slug}`;

    const typeConfig =
      lessonTypeConfig[lesson.type as keyof typeof lessonTypeConfig] ||
      lessonTypeConfig.default;

    const Icon = typeConfig.icon;

    const videoDuration = lesson.videoDurationSeconds;

    return (
      <Link
        key={lesson.id}
        href={lessonPath}
        title={lesson.title}
        prefetch={true}
        onClick={(e) => onClick(e, lessonPath)}
      >
        <div
          className={cn(
            "group flex items-center gap-3 px-3 py-2.5 rounded-md",
            isActive
              ? "bg-primary text-primary-foreground"
              : "hover:bg-secondary/80 text-muted-foreground hover:text-foreground",
          )}
        >
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-sm shrink-0",
              isActive
                ? "bg-primary-foreground/20"
                : `${typeConfig.color.base} ${typeConfig.color.hover}`,
            )}
          >
            <Icon className="w-4 h-4" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium leading-tight truncate">
              {lesson.title}
            </p>
            {lesson.type === "quiz" && (
              <p className="text-xs truncate">
                {lesson.quiz?.length
                  ? `${lesson.quiz.length} task${lesson.quiz.length > 1 ? "s" : ""}`
                  : "no tasks"}
              </p>
            )}

            {lesson.type === "video" && videoDuration && (
              <p className="text-xs truncate">
                {formatDuration(videoDuration || 0)}
              </p>
            )}

            {lesson.type === "text" && lesson.readingTimeSeconds != null && (
              <p className="text-xs truncate">
                {formatReadingTime(lesson.readingTimeSeconds)}
              </p>
            )}
          </div>
          {!lesson.free && !owned && (
            <Lock className="w-4 h-4 shrink-0 text-orange-600 dark:text-orange-500" />
          )}
        </div>
      </Link>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.lesson.id === nextProps.lesson.id &&
      prevProps.isActive === nextProps.isActive &&
      prevProps.owned === nextProps.owned &&
      prevProps.courseSlug === nextProps.courseSlug
    );
  },
);
