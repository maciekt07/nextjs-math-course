"use client";

import {
  Calculator,
  ChevronLeft,
  ChevronRight,
  FileText,
  type LucideIcon,
  Video,
} from "lucide-react";
import Link from "next/link";
import { useSidebarStore } from "@/stores/sidebar-store";
import type { Lesson } from "@/types/payload-types";

interface LessonNavigationProps {
  courseSlug: string;
  previousLesson: Lesson | null;
  nextLesson: Lesson | null;
}

export function LessonNavigation({
  courseSlug,
  previousLesson,
  nextLesson,
}: LessonNavigationProps) {
  if (!previousLesson && !nextLesson) return null;

  return (
    <nav className="mt-8 mb-8 w-full font-inter print:hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 max-w-4xl mx-auto">
        <LessonCard
          lesson={previousLesson}
          isPrevious
          courseSlug={courseSlug}
        />
        <LessonCard
          lesson={nextLesson}
          isPrevious={false}
          courseSlug={courseSlug}
        />
      </div>
    </nav>
  );
}

interface LessonCardProps {
  lesson: Lesson | null;
  isPrevious: boolean;
  courseSlug: string;
}

const LESSON_ICONS = {
  video: Video,
  quiz: Calculator,
  default: FileText,
} as const satisfies Record<"video" | "quiz" | "default", LucideIcon>;

const LessonCard = ({ lesson, isPrevious, courseSlug }: LessonCardProps) => {
  const setOptimisticPath = useSidebarStore((state) => state.setOptimisticPath);
  if (!lesson) return <LessonPlaceholder isPrevious={isPrevious} />;

  const Icon =
    LESSON_ICONS[lesson.type as keyof typeof LESSON_ICONS] ??
    LESSON_ICONS.default;
  const path = `/course/${courseSlug}/${lesson.slug}`;

  return (
    <Link
      href={path}
      prefetch
      aria-label={`${isPrevious ? "Previous" : "Next"} lesson - ${lesson.title}`}
      className="group flex-1 min-h-[5rem] p-4 rounded-lg border border-border transition-all duration-200 flex items-center justify-between"
      onClick={() => setOptimisticPath(path)}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {isPrevious && (
          <ChevronLeft className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
        )}
        <div className="min-w-0 flex-1">
          <div className="text-xs text-muted-foreground mb-1 transition-colors group-hover:text-foreground">
            {isPrevious ? "Previous lesson" : "Next lesson"}
          </div>
          <div className="font-medium text-sm flex items-center gap-2">
            <Icon className="w-4 h-4 flex-shrink-0 opacity-70" />
            <span className="line-clamp-2 break-words leading-tight">
              {lesson.title}
            </span>
          </div>
        </div>
      </div>
      {!isPrevious && (
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0 ml-3" />
      )}
    </Link>
  );
};

const LessonPlaceholder = ({ isPrevious }: { isPrevious: boolean }) => (
  <div className="flex-1 min-h-[5rem] opacity-60 select-none p-4 rounded-lg border border-border/50 flex items-center justify-between bg-muted/20 cursor-not-allowed">
    <div className="flex items-center gap-3 min-w-0">
      {isPrevious && (
        <ChevronLeft className="w-5 h-5 text-muted-foreground/50 flex-shrink-0" />
      )}
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground/70 mb-0.5">
          {isPrevious ? "Previous lesson" : "Next lesson"}
        </div>
        <div className="text-sm text-muted-foreground/50">
          {isPrevious
            ? "Nothing before this lesson"
            : "Nothing after this lesson"}
        </div>
      </div>
    </div>
    {!isPrevious && (
      <ChevronRight className="w-5 h-5 text-muted-foreground/50 flex-shrink-0 ml-3" />
    )}
  </div>
);
