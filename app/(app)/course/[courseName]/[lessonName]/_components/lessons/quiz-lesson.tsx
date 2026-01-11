"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  CircleEqual,
  Eye,
  Lightbulb,
  X,
} from "lucide-react";
import { useState } from "react";
import { MarkdownRenderer } from "@/components/markdown";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/ui";
import type { Lesson } from "@/payload-types";

interface QuizLessonProps {
  lesson: Lesson;
}

export function QuizLesson({ lesson }: QuizLessonProps) {
  const [activeQuestionIdx, setActiveQuestionIdx] = useState<number>(0);
  const [submittedAnswers, setSubmittedAnswers] = useState<
    Record<number, number>
  >({});
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hintsVisible, setHintsVisible] = useState<Record<number, boolean>>({});

  const questions = lesson.quiz || [];
  const activeQuestion = questions[activeQuestionIdx];

  if (!activeQuestion) {
    return (
      <div className="flex justify-center items-center min-h-[200px] px-4">
        <Card className="w-full max-w-md shadow-none">
          <CardContent className="py-8 flex justify-center">
            <p className="text-muted-foreground text-center">
              No quiz questions available.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasOptions =
    (activeQuestion.options && activeQuestion.options.length > 0) || false;
  const isSubmitted = submittedAnswers[activeQuestionIdx] !== undefined;
  const submittedOptionIdx = submittedAnswers[activeQuestionIdx];
  const isCorrect =
    isSubmitted &&
    hasOptions &&
    submittedOptionIdx !== undefined &&
    activeQuestion.options?.[submittedOptionIdx]?.isCorrect;
  const isHintVisible = hintsVisible[activeQuestionIdx];

  const handleOptionSelect = (optionIdx: number) => {
    if (!isSubmitted) {
      setSelectedOption(optionIdx);
    }
  };

  const handleSubmit = () => {
    if (!isSubmitted) {
      if (hasOptions && selectedOption !== null) {
        setSubmittedAnswers((prev) => ({
          ...prev,
          [activeQuestionIdx]: selectedOption,
        }));
      } else if (!hasOptions) {
        setSubmittedAnswers((prev) => ({
          ...prev,
          [activeQuestionIdx]: -1,
        }));
      }
    }
  };

  const navigateToPrevious = () => {
    if (activeQuestionIdx > 0) {
      setActiveQuestionIdx(activeQuestionIdx - 1);
      setSelectedOption(submittedAnswers[activeQuestionIdx - 1] ?? null);
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  };

  const navigateToNext = () => {
    if (activeQuestionIdx < questions.length - 1) {
      setActiveQuestionIdx(activeQuestionIdx + 1);
      setSelectedOption(submittedAnswers[activeQuestionIdx + 1] ?? null);
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 -mt-3">
      {questions.length > 1 && (
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            {questions.map((question, idx) => {
              const isCurrent = idx === activeQuestionIdx;

              return (
                <Button
                  key={question.id}
                  variant={isCurrent ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setActiveQuestionIdx(idx);
                    setSelectedOption(submittedAnswers[idx] ?? null);
                    window.scrollTo({ top: 0, behavior: "instant" });
                  }}
                  className="size-10 cursor-pointer"
                >
                  {idx + 1}
                </Button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={navigateToPrevious}
              disabled={activeQuestionIdx === 0}
              className="cursor-pointer"
            >
              <ChevronLeft size={16} />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={navigateToNext}
              disabled={activeQuestionIdx === questions.length - 1}
              className="cursor-pointer"
            >
              Next
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}

      <Card className="shadow-none bg-card/50 dark:bg-card">
        <CardHeader className="border-b-1 pb-4">
          <CardTitle>
            <MarkdownRenderer content={activeQuestion.question} />
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {activeQuestion.hint && !hintsVisible[activeQuestionIdx] && (
            <Button
              variant="outline"
              onClick={() => {
                setHintsVisible((prev) => ({
                  ...prev,
                  [activeQuestionIdx]: true,
                }));
              }}
              className="cursor-pointer"
            >
              <Lightbulb size={16} />
              Show Hint
            </Button>
          )}
          {isHintVisible && activeQuestion.hint && (
            <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900 py-4">
              <CardContent className="px-4">
                <div className="flex justify-left items-center gap-2">
                  <Lightbulb
                    size={20}
                    className="text-amber-600 dark:text-amber-500"
                  />
                  <MarkdownRenderer content={activeQuestion.hint} />
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            {activeQuestion.options?.map((option, optionIdx) => {
              const isSelected = selectedOption === optionIdx;
              const isThisCorrect = option.isCorrect;
              const showAsCorrect = isSubmitted && isThisCorrect;
              const showAsIncorrect =
                isSubmitted && isSelected && !isThisCorrect;

              return (
                <button
                  key={option.id || optionIdx}
                  type="button"
                  onClick={() => handleOptionSelect(optionIdx)}
                  disabled={isSubmitted}
                  className={cn(
                    "w-full text-left p-4 rounded-xl border-2 transition-colors duration-150 shadow-xs",
                    !isSubmitted &&
                      "hover:bg-accent hover:border-accent-foreground/20 cursor-pointer",
                    !isSubmitted &&
                      isSelected &&
                      "border-primary bg-primary/5 hover:border-primary",
                    !isSubmitted && !isSelected && "border-border",
                    isSubmitted && "cursor-default",
                    showAsCorrect &&
                      "border-green-500 bg-green-50 dark:bg-green-950/20",
                    showAsIncorrect &&
                      "border-red-500 bg-red-50 dark:bg-red-950/20",
                    isSubmitted &&
                      !showAsCorrect &&
                      !showAsIncorrect &&
                      "border-border opacity-60",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full shrink-0 mt-0.5 transition-colors duration-300",
                        !isSubmitted &&
                          !isSelected &&
                          "border-2 border-muted-foreground/50",
                        !isSubmitted && isSelected && "bg-primary",
                        showAsCorrect && "bg-green-500",
                        showAsIncorrect && "bg-red-500",
                        isSubmitted &&
                          !showAsCorrect &&
                          !showAsIncorrect &&
                          "border-2 border-muted-foreground/50",
                      )}
                    >
                      {!isSubmitted && !isSelected && (
                        <motion.div
                          className="w-2 h-2 rounded-full bg-transparent"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 20,
                          }}
                        />
                      )}
                      {!isSubmitted && isSelected && (
                        <motion.div
                          className="w-2 h-2 rounded-full bg-white"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          whileHover={{ scale: 1.5 }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 20,
                          }}
                        />
                      )}

                      {showAsCorrect && (
                        <motion.div
                          initial={{ scale: 0, rotate: -45, opacity: 0 }}
                          animate={{ scale: 1, rotate: 0, opacity: 1 }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 20,
                            delay: 0.1,
                          }}
                        >
                          <Check
                            className="w-4 h-4 text-white"
                            strokeWidth={3}
                          />
                        </motion.div>
                      )}
                      {showAsIncorrect && (
                        <motion.div
                          initial={{ scale: 0, rotate: 45, opacity: 0 }}
                          animate={{ scale: 1, rotate: 0, opacity: 1 }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 20,
                            delay: 0.1,
                          }}
                        >
                          <X className="w-4 h-4 text-white" strokeWidth={3} />
                        </motion.div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <MarkdownRenderer content={option.text} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="flex flex-col gap-3">
            {!isSubmitted && (
              <Button
                onClick={handleSubmit}
                disabled={hasOptions && selectedOption === null}
                className="w-full cursor-pointer"
                size="lg"
              >
                {hasOptions ? (
                  "Submit Answer"
                ) : (
                  <>
                    <Eye /> Show Solution
                  </>
                )}
              </Button>
            )}
            {isSubmitted && activeQuestionIdx !== questions.length - 1 && (
              <Button
                onClick={navigateToNext}
                className="w-full cursor-pointer"
                size="lg"
                variant="green"
              >
                Next Question <ArrowRight />
              </Button>
            )}
            {isSubmitted && activeQuestionIdx === questions.length - 1 && (
              <div className="text-center text-sm text-muted-foreground">
                This was the last question in the quiz.
              </div>
            )}
            {activeQuestionIdx !== 0 && (
              <Button
                onClick={navigateToPrevious}
                className="w-full cursor-pointer"
                size="lg"
                variant="outline"
              >
                <ArrowLeft /> Previous Question
              </Button>
            )}
          </div>
          {isSubmitted && activeQuestion.solution && (
            <Card
              className={cn(
                "border-1 shadow-none",
                isCorrect
                  ? "bg-green-50/80 dark:bg-green-950/20 "
                  : "bg-blue-50/80 dark:bg-blue-950/20 ",
              )}
            >
              <CardHeader>
                <CardTitle
                  className={cn(
                    "text-xl flex items-center gap-2",
                    isCorrect
                      ? "text-green-600 dark:text-green-400"
                      : "text-blue-600 dark:text-blue-400",
                  )}
                >
                  {isCorrect ? (
                    <>
                      <CheckCircle />
                      Correct!
                    </>
                  ) : (
                    <>
                      <CircleEqual />
                      Solution
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MarkdownRenderer content={activeQuestion.solution} />
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
