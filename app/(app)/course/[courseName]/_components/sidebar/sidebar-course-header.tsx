"use client";

import { ChevronLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import BuyCourseButton from "@/components/buy-course-button";
import { Button } from "@/components/ui/button";
import type { Course, Poster } from "@/types/payload-types";

interface SidebarCourseHeaderProps {
  course: Course;
  owned?: boolean;
}

export function SidebarCourseHeader({
  course,
  owned,
}: SidebarCourseHeaderProps) {
  return (
    <div className="pt-14 sm:pt-16 px-4 border-b">
      <Button asChild variant="ghost" className="absolute top-4 right-4">
        <Link href="/">
          <ChevronLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </Button>

      <div className="flex md:block gap-3 mb-3 mt-2">
        {course.poster && (
          <div className="relative w-20 h-20 md:w-full md:h-40 shrink-0 overflow-hidden rounded-lg md:rounded-2xl shadow-md md:mb-4">
            <Image
              src={(course.poster as Poster).url!}
              alt={(course.poster as Poster).alt ?? course.title!}
              fill
              priority
              sizes="(min-width: 768px) 287px, 80px"
              className="object-cover"
              placeholder={
                (course.poster as Poster).blurhash ? "blur" : "empty"
              }
              blurDataURL={(course.poster as Poster).blurhash || undefined}
            />
          </div>
        )}

        <div className="flex-1 min-w-0 md:hidden space-y-1">
          <h2 className="font-semibold text-base leading-tight">
            {course.title}
          </h2>
          {course.description && (
            <p
              className="text-xs text-muted-foreground line-clamp-2"
              title={course.description}
            >
              {course.description}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <div className="hidden md:flex items-center gap-2">
          <h2 className="font-semibold text-lg leading-tight">
            {course.title}
          </h2>
        </div>

        {course.description && (
          <div className="line-clamp-3 md:mb-3">
            <p
              className="hidden md:block text-sm text-muted-foreground"
              title={course.description}
            >
              {course.description}
            </p>
          </div>
        )}

        {!owned && (
          <BuyCourseButton
            courseId={course.id}
            variant="outline"
            className="w-full font-bold mb-3"
            size="default"
          >
            Buy Course
          </BuyCourseButton>
        )}
      </div>
    </div>
  );
}
