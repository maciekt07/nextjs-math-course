"use client";

import { BadgeCheck, ChevronLeft, Lock, LogIn } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import BuyCourseButton from "@/components/buy-course-button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import type { Course, Lesson } from "@/payload-types";

export function CourseSidebar({
  course,
  lessons,
  courseName,
  owned,
}: {
  course: Course;
  lessons: Lesson[];
  courseName: string;
  owned?: boolean;
}) {
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();

  return (
    <div className="w-90 border-r bg-background flex flex-col h-full">
      <div className="p-4 border-b">
        <Button asChild variant="ghost" size="sm" className="mb-3">
          <Link href="/">
            <ChevronLeft />
            Back to Home
          </Link>
        </Button>
        <div className="flex items-start gap-3">
          <div>
            <h2 className="font-semibold text-lg leading-tight">
              <span>{course.title}</span>
              {owned && (
                <Badge className="ml-2">
                  <BadgeCheck />
                  Owned
                </Badge>
              )}
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
                      "flex items-center px-3 py-2.5 rounded-lg transition-colors cursor-pointer",
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
                    <div className="flex-1 flex items-center justify-between ml-3 min-w-0">
                      <p
                        className={cn(
                          "text-sm font-medium leading-tight truncate",
                          isActive && "text-foreground",
                        )}
                      >
                        {lesson.title}
                      </p>

                      {!lesson.free && !owned && (
                        <Lock className="flex-shrink-0 ml-2 text-orange-600 dark:text-orange-500" />
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="p-4 border-t mt-auto">
        {isPending ? (
          <div className="flex items-center justify-center py-2">
            <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : session?.user ? (
          <div className="flex items-center gap-2">
            <Link
              href="/account"
              className="flex items-center gap-2 flex-1 min-w-0 rounded-lg hover:bg-secondary/50 transition-colors p-2 -ml-2"
            >
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                  {session.user.name?.charAt(0).toUpperCase() ||
                    session.user.email?.charAt(0).toUpperCase() ||
                    "U"}
                </AvatarFallback>
              </Avatar>
              <p className="text-sm font-medium leading-tight truncate">
                {session.user.name || "User"}
              </p>
            </Link>
            {!owned && (
              <BuyCourseButton courseId={course.id} size="sm" variant="outline">
                Buy Course
              </BuyCourseButton>
            )}
          </div>
        ) : (
          <Button asChild className="w-full">
            <Link
              href={`/auth/sign-in?returnTo=${encodeURIComponent(pathname)}`}
            >
              <LogIn /> Log In
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
