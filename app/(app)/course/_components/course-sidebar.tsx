"use client";

import { BookOpen, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Course, Lesson } from "@/payload-types";

export function CourseSidebar({
  course,
  lessons,
  courseName,
}: {
  course: Course;
  lessons: Lesson[];
  courseName: string;
}) {
  const pathname = usePathname();

  return (
    <div className="w-80 border-r bg-background flex flex-col h-full">
      <div className="p-4 border-b">
        <Link href="/courses">
          <Button variant="ghost" size="sm" className="mb-3">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
        </Link>
        <div className="flex items-start gap-3">
          <BookOpen className="h-5 w-5 mt-1 text-primary" />
          <div>
            <h2 className="font-semibold text-lg leading-tight">
              {course.title}
            </h2>
            {course.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {course.description}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          <div className="mb-2 px-3 py-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Lessons ({lessons.length})
            </p>
          </div>

          <nav className="space-y-1">
            {lessons.map((lesson) => {
              const lessonPath = `/course/${courseName}/${lesson.slug}`;
              const isActive = pathname === lessonPath;

              return (
                <Link key={lesson.id} href={lessonPath}>
                  <div
                    className={cn(
                      "flex items-start gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer",
                      isActive
                        ? "bg-secondary text-secondary-foreground"
                        : "hover:bg-secondary/50 text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-xs font-medium",
                        isActive
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background",
                      )}
                    >
                      {lesson.order}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-sm font-medium leading-tight truncate",
                          isActive && "text-foreground",
                        )}
                      >
                        {lesson.title} {lesson.free && "(Free)"}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
