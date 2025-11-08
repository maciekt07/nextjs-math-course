"use client";

import { BookOpen, Check, GraduationCap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import BuyCourseButton from "@/components/buy-course-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Course, Media } from "@/payload-types";

interface CourseCardProps {
  course: Course & { lessonCount: number | undefined };
  owned: boolean;
  minimal?: boolean;
}

export function CourseCard({ course, owned, minimal }: CourseCardProps) {
  return (
    <Card key={course.id} className="flex flex-col">
      <CardHeader>
        <div className="flex items-start gap-4">
          {course.media ? (
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden shrink-0">
              <Image
                src={(course.media as Media).url!}
                alt={(course.media as Media).alt ?? course.title}
                width={128}
                height={128}
                className="object-cover w-full h-full"
                placeholder={
                  (course.media as Media).blurhash ? "blur" : "empty"
                }
                blurDataURL={(course.media as Media).blurhash || undefined}
              />
            </div>
          ) : (
            <div className="w-20 h-20 p-4 rounded-lg border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950 shrink-0 flex items-center justify-center">
              <GraduationCap className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl md:text-2xl text-left">
              {course.title}
            </CardTitle>
            <CardDescription className="mt-1 text-left">
              {course.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 flex-1">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen size={20} /> {course.lessonCount} Chapters
          </div>
        </div>
        {minimal ? null : owned ? (
          <Button size="lg" asChild>
            <Link href={`/course/${course.slug}`}>See All Lessons</Link>
          </Button>
        ) : (
          <Button variant="green" size="lg" asChild>
            <Link href={`/course/${course.slug}`}>See Free Lessons</Link>
          </Button>
        )}
      </CardContent>
      {!minimal && (
        <CardFooter className="border-t dark:border-border min-h-[80px] flex items-center">
          {owned ? (
            <div className="flex items-center justify-center w-full gap-2">
              <Check size={28} className="text-green-600" />
              <span className="font-semibold">Owned</span>
            </div>
          ) : (
            <div className="flex justify-between w-full items-center">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground uppercase tracking-wide">
                  Price
                </span>
                <span className="text-2xl font-bold">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(course.price ?? 0)}
                </span>
              </div>

              <BuyCourseButton
                courseId={course.id}
                size="lg"
                className="font-bold"
              >
                Buy Now
              </BuyCourseButton>
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
