"use client";

import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Info,
  Lightbulb,
  XCircle,
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

//TODO: store completed in local storage

export function QuizLesson({ lesson }: QuizLessonProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, number>
  >({});
  const [showHints, setShowHints] = useState<Record<number, boolean>>({});
  const [showSolutions, setShowSolutions] = useState<Record<number, boolean>>(
    {},
  );

  const quizzes = lesson.quiz || [];
  const currentQuiz = quizzes[currentQuestionIndex];

  if (!currentQuiz) {
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

  const handleSelectAnswer = (questionIndex: number, optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));

    setShowSolutions((prev) => ({
      ...prev,
      [questionIndex]: true,
    }));
  };

  const toggleHint = (questionIndex: number) => {
    setShowHints((prev) => ({
      ...prev,
      [questionIndex]: !prev[questionIndex],
    }));
  };

  const selectedOptionIndex = selectedAnswers[currentQuestionIndex];
  const hasSelected = selectedOptionIndex !== undefined;
  const selectedOption = hasSelected
    ? currentQuiz.options[selectedOptionIndex]
    : null;

  const showSolution = showSolutions[currentQuestionIndex];
  const showHint = showHints[currentQuestionIndex];

  const goToPrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentQuestionIndex < quizzes.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        {lesson.content && (
          <div className="mt-4 text-muted-foreground">
            <MarkdownRenderer content={lesson.content} />
          </div>
        )}
      </div>
      {quizzes.length > 1 && (
        <div className="mb-6 flex items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            {quizzes.map((q, index) => {
              // const isAnswered = selectedAnswers[index] !== undefined;
              const isCurrent = index === currentQuestionIndex;
              // const isCorrect =
              //   isAnswered &&
              //   quizzes[index].options[selectedAnswers[index]]?.isCorrect;

              return (
                <Button
                  key={`answer-btn-${q.id || index}`}
                  variant={isCurrent ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentQuestionIndex(index)}
                  // className={cn(
                  //   "min-w-10",
                  //   isAnswered &&
                  //     !isCurrent &&
                  //     (isCorrect
                  //       ? "border-green-500 text-green-600 dark:text-green-500"
                  //       : "border-red-500 text-red-600 dark:text-red-500"),
                  // )}
                  className="w-10 h-10 cursor-pointer"
                >
                  {index + 1}
                </Button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrevious}
              disabled={currentQuestionIndex === 0}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNext}
              disabled={currentQuestionIndex === quizzes.length - 1}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
      <Card className="mb-6">
        <CardHeader>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <Badge variant="secondary">
                Question {currentQuestionIndex + 1} of {quizzes.length}
              </Badge>
              {currentQuiz.hint && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleHint(currentQuestionIndex)}
                  className="shrink-0"
                >
                  <Lightbulb className="w-4 h-4 mr-2" />
                  {showHint ? "Hide" : "Show"} Hint
                </Button>
              )}
            </div>
            <CardTitle className="text-2xl">
              <MarkdownRenderer content={currentQuiz.question} />
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {showHint && currentQuiz.hint && (
            <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900">
              <CardContent>
                <div className="flex gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <MarkdownRenderer content={currentQuiz.hint} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            {currentQuiz.options.map((option, optionIndex) => {
              const isSelected = selectedOptionIndex === optionIndex;
              const isCorrectOption = option.isCorrect;
              const showCorrect = hasSelected && isCorrectOption;
              const showIncorrect =
                isSelected && !isCorrectOption && hasSelected;

              return (
                <button
                  type="button"
                  key={option.id || optionIndex}
                  onClick={() =>
                    handleSelectAnswer(currentQuestionIndex, optionIndex)
                  }
                  disabled={hasSelected}
                  className={cn(
                    "w-full text-left p-4 rounded-lg border-2 transition-all duration-200",
                    "hover:border-primary disabled:cursor-not-allowed",
                    !hasSelected && "hover:bg-secondary/50",
                    isSelected && !hasSelected && "border-primary bg-primary/5",
                    showCorrect &&
                      "border-green-500 bg-green-50 dark:bg-green-950/20",
                    showIncorrect &&
                      "border-red-500 bg-red-50 dark:bg-red-950/20",
                    !isSelected && !showCorrect && hasSelected && "opacity-50",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full border-2 shrink-0 mt-0.5",
                        showCorrect && "border-green-500 bg-green-500",
                        showIncorrect && "border-red-500 bg-red-500",
                        !hasSelected &&
                          isSelected &&
                          "border-primary bg-primary",
                        !hasSelected &&
                          !isSelected &&
                          "border-muted-foreground",
                      )}
                    >
                      {showCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      )}
                      {showIncorrect && (
                        <XCircle className="w-4 h-4 text-white" />
                      )}
                      {!hasSelected && isSelected && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <MarkdownRenderer content={option.text} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {showSolution && currentQuiz.solution && (
            <Card
              className={cn(
                "border-2",
                selectedOption?.isCorrect
                  ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900"
                  : "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900",
              )}
            >
              <CardContent>
                <div className="flex gap-2">
                  {selectedOption?.isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-500 shrink-0 mt-0.5" />
                  ) : (
                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-500 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold mb-2">
                      {selectedOption?.isCorrect ? "Correct!" : "Solution"}
                    </p>
                    <MarkdownRenderer content={currentQuiz.solution} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
      {quizzes.length > 1 && (
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={goToPrevious}
            disabled={currentQuestionIndex === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous Question
          </Button>
          <span className="text-sm text-muted-foreground">
            {Object.keys(selectedAnswers).length} of {quizzes.length} answered
          </span>
          <Button
            variant="outline"
            onClick={goToNext}
            disabled={currentQuestionIndex === quizzes.length - 1}
          >
            Next Question
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}
