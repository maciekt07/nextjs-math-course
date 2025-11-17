"use client";

import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { Lesson } from "@/payload-types";
import { useSettingsStore } from "@/stores/settingsStore";
import { LessonTitle } from "./lesson-title";
import { QuizLesson } from "./lessons/quiz-lesson";
import { TextLesson } from "./lessons/text-lesson";
import { VideoLesson } from "./lessons/video-lesson";

interface LessonContentWrapperProps {
  lesson: Lesson | null;
}

export function LessonContentWrapper({ lesson }: LessonContentWrapperProps) {
  const { fontStyle } = useSettingsStore();

  const fontClass = {
    default: "font-inter",
    system: "font-system",
  }[fontStyle];

  return (
    <article
      className={cn(
        "mx-auto py-8 mt-10 px-6",
        lesson?.type === "video" ? "max-w-6xl" : "max-w-4xl",
        fontClass,
      )}
    >
      {/* key={lesson.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeIn" }} */}
      <LessonTitle lesson={lesson} />
      <Separator className="mb-8" />
      {lesson?.type === "text" && <TextLesson lesson={lesson} />}
      {lesson?.type === "quiz" && <QuizLesson lesson={lesson} />}
      {lesson?.type === "video" && <VideoLesson lesson={lesson} />}
    </article>
  );
}
