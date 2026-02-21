import { Separator } from "@/components/ui/separator";
import type { Lesson } from "@/types/payload-types";
import { LessonClientShell } from "./lesson-client-shell";
import { LessonTitle } from "./lesson-title";
import { QuizLesson } from "./lessons/quiz-lesson";
import { TextLesson } from "./lessons/text-lesson";
import { VideoLesson } from "./lessons/video";

interface Props {
  lesson: Lesson;
  children?: React.ReactNode;
}

export function LessonLayout({ lesson, children }: Props) {
  return (
    <LessonClientShell type={lesson.type}>
      <LessonTitle lesson={lesson} />
      <Separator className="mb-8" />
      {lesson.type === "text" && <TextLesson lesson={lesson} />}
      {lesson.type === "quiz" && <QuizLesson quiz={lesson.quiz} />}
      {lesson.type === "video" && <VideoLesson lesson={lesson} />}
      {children}
    </LessonClientShell>
  );
}
