"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Info,
  Lightbulb,
  X,
} from "lucide-react";
import { useState } from "react";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
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
        <Card className="w-full max-w-md">
          <CardContent className="py-8 flex justify-center">
            <p className="text-muted-foreground text-center">
              No quiz questions available.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isSubmitted = submittedAnswers[activeQuestionIdx] !== undefined;
  const submittedOptionIdx = submittedAnswers[activeQuestionIdx];
  const isCorrect =
    isSubmitted && activeQuestion.options[submittedOptionIdx]?.isCorrect;
  const isHintVisible = hintsVisible[activeQuestionIdx];

  const handleOptionSelect = (optionIdx: number) => {
    if (!isSubmitted) {
      setSelectedOption(optionIdx);
    }
  };

  const handleSubmit = () => {
    if (selectedOption !== null && !isSubmitted) {
      setSubmittedAnswers((prev) => ({
        ...prev,
        [activeQuestionIdx]: selectedOption,
      }));
    }
  };

  const navigateToPrevious = () => {
    if (activeQuestionIdx > 0) {
      setActiveQuestionIdx(activeQuestionIdx - 1);
      setSelectedOption(submittedAnswers[activeQuestionIdx - 1] ?? null);
    }
  };

  const navigateToNext = () => {
    if (activeQuestionIdx < questions.length - 1) {
      setActiveQuestionIdx(activeQuestionIdx + 1);
      setSelectedOption(submittedAnswers[activeQuestionIdx + 1] ?? null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {lesson.content && (
        <div className="text-muted-foreground">
          <MarkdownRenderer content={lesson.content} />
        </div>
      )}

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
                  }}
                  className="w-10 h-10 cursor-pointer"
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
              <ChevronLeft className="w-4 h-4" />
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
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="space-y-3">
            <Badge variant="secondary">
              Question {activeQuestionIdx + 1} of {questions.length}
            </Badge>
            <CardTitle className="text-2xl">
              <MarkdownRenderer content={activeQuestion.question} />
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {activeQuestion.hint && !hintsVisible[activeQuestionIdx] && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setHintsVisible((prev) => ({
                  ...prev,
                  [activeQuestionIdx]: true,
                }));
              }}
              className="shrink-0 cursor-pointer"
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              {isHintVisible ? "Hide" : "Show"} Hint
            </Button>
          )}
          {isHintVisible && activeQuestion.hint && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "none" }}
              transition={{ duration: 0.2 }}
            >
              <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900">
                <CardContent>
                  <div className="flex gap-3">
                    <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <MarkdownRenderer content={activeQuestion.hint} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <div className="space-y-3">
            {activeQuestion.options.map((option, optionIdx) => {
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
                    "w-full text-left p-4 rounded-lg border-2 transition-colors",
                    !isSubmitted &&
                      "hover:bg-accent hover:border-accent-foreground/20 cursor-pointer",
                    !isSubmitted && isSelected && "border-primary bg-primary/5",
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
                        "flex h-6 w-6 items-center justify-center rounded-full shrink-0 mt-0.5 transition-colors",
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

          {!isSubmitted && (
            <Button
              onClick={handleSubmit}
              disabled={selectedOption === null}
              className="w-full cursor-pointer"
              size="lg"
            >
              Submit Answer
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
          {/* 
          {isSubmitted && !isCorrect && (
            <div className="text-center text-red-500 font-bold">
              Not quite right
            </div>
          )} */}

          {isSubmitted && activeQuestion.solution && (
            <Card
              className={cn(
                "border-2",
                isCorrect
                  ? "bg-green-50 dark:bg-green-950/20 border-green-500"
                  : "bg-blue-50 dark:bg-blue-950/20 border-blue-500",
              )}
            >
              <CardContent>
                <div className="flex gap-3 items-start">
                  {isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                  ) : (
                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0 space-y-2">
                    <p className="font-semibold text-lg">
                      {isCorrect ? "Correct!" : "Solution"}
                    </p>
                    <div className="text-sm break-words">
                      <MarkdownRenderer content={activeQuestion.solution} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
