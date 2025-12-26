"use client";
import {
  Calculator,
  ChevronLeft,
  ChevronRight,
  FileText,
  Video,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import type { Lesson } from "@/payload-types";
import { useCourseStore } from "@/stores/course-store";
import { useSidebarStore } from "@/stores/sidebar-store";

export function LessonNavigation({
  currentSlug,
}: {
  currentSlug?: string | null;
}) {
  const { lessonsMeta, course } = useCourseStore();
  const { open: sidebarOpen, setOptimisticPath } = useSidebarStore();

  const { previousLesson, nextLesson } = useMemo(() => {
    const index = lessonsMeta.findIndex((l) => l.slug === currentSlug);
    return {
      previousLesson: index > 0 ? lessonsMeta[index - 1] : null,
      nextLesson:
        index >= 0 && index < lessonsMeta.length - 1
          ? lessonsMeta[index + 1]
          : null,
    };
  }, [lessonsMeta, currentSlug]);

  if (!lessonsMeta?.length || (!previousLesson && !nextLesson)) return null;

  const getLessonIcon = (lesson: Lesson) => {
    switch (lesson.type) {
      case "video":
        return Video;
      case "quiz":
        return Calculator;
      default:
        return FileText;
    }
  };

  const getLessonPath = (lesson: Lesson) =>
    `/course/${course?.slug}/${lesson.slug}`;

  const renderPlaceholder = (isPrevious: boolean) => (
    <div className="flex-1 min-h-[5rem] opacity-50 select-none p-4 rounded-lg border border-border/50 flex items-center justify-between bg-muted/20 cursor-not-allowed">
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

  const renderLessonCard = (lesson: Lesson | null, isPrevious = false) => {
    if (!lesson) return renderPlaceholder(isPrevious);

    const Icon = getLessonIcon(lesson);

    return (
      <Link
        href={getLessonPath(lesson)}
        aria-label={`${isPrevious ? "Previous" : "Next"} lesson - ${lesson.title}`}
        onClick={() => sidebarOpen && setOptimisticPath(getLessonPath(lesson))}
        className="group flex-1 min-h-[5rem] p-4 rounded-lg border border-border transition-all duration-200 flex items-center justify-between"
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

  return (
    <nav className="mt-8 mb-8 w-full font-inter">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 max-w-6xl mx-auto">
        {renderLessonCard(previousLesson, true)}
        {renderLessonCard(nextLesson)}
      </div>
    </nav>
  );
}
