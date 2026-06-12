import { BookOpen, Clock, GraduationCap, HelpCircle } from "lucide-react";
import Image from "next/image";
import type * as React from "react";
import {
  CourseCardOwnershipButton,
  CourseCardOwnershipFooter,
} from "@/components/course-card-ownership";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/ui";
import type { Course, Poster } from "@/types/payload-types";

interface CourseCardProps extends React.ComponentProps<"div"> {
  course: Course;
  owned: boolean;
  customContent?: React.ReactNode;
}

export function CourseCard({
  course,
  owned,
  customContent,
  className,
  ...props
}: CourseCardProps) {
  const palette =
    typeof course.poster === "object" && course.poster
      ? course.poster.palette
      : {};

  const dominant = palette?.dominant ?? "#8f8f8f";
  const defaultCourseHref = course.slug ? `/course/${course.slug}` : "#";
  const ownedCourseHref =
    course.slug && course.firstLessonSlug
      ? `/course/${course.slug}/${course.firstLessonSlug}`
      : defaultCourseHref;
  const previewCourseHref =
    course.slug && (course.firstFreeLessonSlug ?? course.firstLessonSlug)
      ? `/course/${course.slug}/${course.firstFreeLessonSlug ?? course.firstLessonSlug}`
      : defaultCourseHref;

  const cardBackground =
    "linear-gradient(155deg, color-mix(in oklab, var(--d) var(--start), transparent), color-mix(in oklab, var(--d) var(--mid), transparent) 40%, transparent)";
  const hoverBackground =
    "radial-gradient(circle at 50% 0%, color-mix(in srgb, var(--d) 15%, transparent), transparent 85%)";

  return (
    <Card
      key={course.id}
      className={cn(
        "group relative flex flex-col py-4 md:py-5 rounded-3xl",
        "[--start:18%] [--mid:9%]",
        "dark:[--start:12%] dark:[--mid:6%]",
        className,
      )}
      style={{
        "--d": dominant,
        background: cardBackground,
      }}
      {...props}
    >
      <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-b from-black/4 to-transparent dark:from-white/6" />
      <div
        className="pointer-events-none absolute inset-0 sm:opacity-0 opacity-100 group-hover:opacity-100 transition-opacity duration-400 rounded-3xl"
        style={{
          background: hoverBackground,
        }}
      />

      <CardHeader className="px-4 md:px-5 relative">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          {course.poster ? (
            <div className="relative w-full h-48 sm:w-32 sm:h-32 sm:aspect-square rounded-lg overflow-hidden shadow-lg">
              <Image
                src={(course.poster as Poster).url!}
                alt={(course.poster as Poster).alt ?? course.title ?? "Preview"}
                fill
                className="object-cover group-hover:scale-110 ease-in-out transition-transform duration-200"
                sizes="(min-width: 640px) 256px, 640px"
                loading="lazy"
                placeholder={
                  (course.poster as Poster).blurhash ? "blur" : "empty"
                }
                blurDataURL={(course.poster as Poster).blurhash || undefined}
              />
            </div>
          ) : (
            <div className="relative w-full h-48 sm:w-32 sm:h-32 rounded-lg border-3 border-primary/30 bg-primary/10 shrink-0 flex items-center justify-center">
              <GraduationCap className="w-16 h-16 text-primary" />
            </div>
          )}

          <div className="flex-1 min-w-0 relative">
            <CardTitle className="text-xl md:text-2xl text-left text-shadow-sm">
              {course.title}
            </CardTitle>
            <CardDescription className="mt-1 text-left text-shadow-2xs">
              {course.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 flex-1 px-4 md:px-5 -mt-4 relative">
        <div className="flex items-center gap-3 mb-1 text-xs sm:text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <BookOpen size={15} /> {course.lessonCount ?? 0} Lessons
          </div>

          {(course.totalReadingTimeSeconds ?? 0) > 0 ||
          (course.totalVideoSeconds ?? 0) > 0 ? (
            <>
              <Separator orientation="vertical" className="bg-foreground/10" />

              <div className="flex items-center gap-1.5">
                <Clock size={15} />{" "}
                {getHoursDisplay(
                  (course.totalReadingTimeSeconds ?? 0) +
                    (course.totalVideoSeconds ?? 0),
                )}{" "}
                hours
              </div>

              {(course.totalQuizQuestions ?? 0) > 0 && (
                <Separator
                  orientation="vertical"
                  className="bg-foreground/10"
                />
              )}
            </>
          ) : (
            (course.totalQuizQuestions ?? 0) > 0 && (
              <Separator orientation="vertical" className="bg-foreground/10" />
            )
          )}

          {(course.totalQuizQuestions ?? 0) > 0 && (
            <div className="flex items-center gap-1.5">
              <HelpCircle size={15} /> {course.totalQuizQuestions} Exercises
            </div>
          )}
        </div>
        {customContent ?? (
          <CourseCardOwnershipButton
            courseId={course.id}
            initialOwned={owned}
            ownedCourseHref={ownedCourseHref}
            previewCourseHref={previewCourseHref}
          />
        )}
      </CardContent>

      {!customContent && (
        <CardFooter className="border-t border-foreground/10 min-h-[80px] flex items-center px-4 md:px-5 [.border-t]:pt-4 md:[.border-t]:pt-5">
          <CourseCardOwnershipFooter
            courseId={course.id}
            initialOwned={owned}
            price={course.price ?? 0}
          />
        </CardFooter>
      )}
    </Card>
  );
}

function getHoursDisplay(seconds: number): string {
  const hours = seconds / 3600;
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(hours);
}
