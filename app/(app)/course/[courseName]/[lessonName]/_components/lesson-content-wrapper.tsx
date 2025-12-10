"use client";

import { type ReactNode, useMemo } from "react";
import { Separator } from "@/components/ui/separator";
import { openDyslexic } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import type { Lesson } from "@/payload-types";
import { useSettingsStore } from "@/stores/settings-store";
import { LessonTitle } from "./lesson-title";
import { QuizLesson } from "./lessons/quiz-lesson";
import { TextLesson } from "./lessons/text-lesson";
import { VideoLesson } from "./lessons/video-lesson";

interface LessonContentWrapperProps {
  lesson: Lesson | null;
  children?: ReactNode;
}

export function LessonContentWrapper({
  lesson,
  children,
}: LessonContentWrapperProps) {
  const { fontStyle } = useSettingsStore();

  const fontClass = useMemo(() => {
    return {
      default: "font-inter",
      system: "font-system",
      dyslexic: "font-dyslexic",
    }[fontStyle];
  }, [fontStyle]);

  return (
    <article
      className={cn(
        "mx-auto pt-8 pb-8 mt-10 px-6",
        lesson?.type === "video" ? "max-w-6xl" : "max-w-4xl",
        fontClass,
        fontStyle === "dyslexic" && openDyslexic.variable,
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
      {children}
    </article>
  );
}
