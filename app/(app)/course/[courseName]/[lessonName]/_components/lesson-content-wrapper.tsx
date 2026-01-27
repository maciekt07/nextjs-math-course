"use client";

import { type ReactNode, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { openDyslexic } from "@/lib/fonts";
import { scrollToHeader } from "@/lib/markdown/scroll-to-header";
import { cn } from "@/lib/ui";
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
  const fontStyle = useSettingsStore((state) => state.fontStyle);

  const fontClass = {
    default: "font-inter",
    system: "font-system",
    dyslexic: "font-dyslexic",
  }[fontStyle];

  useEffect(() => {
    const scrollToHash = () => {
      const hash = window.location.hash.slice(1);
      if (hash)
        scrollToHeader(hash, {
          force: true,
        });
    };

    scrollToHash();

    const onHashChange = (e: HashChangeEvent) => {
      e.preventDefault();
      scrollToHash();
    };
    window.addEventListener("hashchange", onHashChange);

    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return (
    <article
      className={cn(
        "mx-auto pb-8 mt-10 px-4 sm:px-6",
        lesson?.type === "video" ? "max-w-6xl" : "max-w-4xl",
        fontClass,
        fontStyle === "dyslexic" && openDyslexic.variable,
      )}
    >
      <LessonTitle lesson={lesson} />
      <Separator className="mb-8" />
      {lesson?.type === "text" && <TextLesson lesson={lesson} />}
      {lesson?.type === "quiz" && <QuizLesson lesson={lesson} />}
      {lesson?.type === "video" && <VideoLesson lesson={lesson} />}
      {children}
    </article>
  );
}
