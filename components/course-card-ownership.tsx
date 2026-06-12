"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import BuyCourseButton from "@/components/buy-course-button";
import { useOwnedCourse } from "@/components/owned-courses-provider";
import { Button } from "@/components/ui/button";

type CourseCardOwnershipProps = {
  courseId: string;
  initialOwned: boolean;
  ownedCourseHref: string;
  previewCourseHref: string;
  price: number;
};

export function CourseCardOwnershipButton({
  courseId,
  initialOwned,
  ownedCourseHref,
  previewCourseHref,
}: Omit<CourseCardOwnershipProps, "price">) {
  const owned = useOwnedCourse(courseId, initialOwned);

  if (owned) {
    return (
      <Button size="lg" asChild>
        <Link prefetch href={ownedCourseHref}>
          See All Lessons
        </Link>
      </Button>
    );
  }

  return (
    <Button
      variant="green"
      size="lg"
      asChild
      className="bg-background/20 hover:bg-background/50 border-foreground/10 shadow-sm"
    >
      <Link prefetch href={previewCourseHref} className="text-shadow-sm">
        See Free Lessons
      </Link>
    </Button>
  );
}

export function CourseCardOwnershipFooter({
  courseId,
  initialOwned,
  price,
}: Pick<CourseCardOwnershipProps, "courseId" | "initialOwned" | "price">) {
  const owned = useOwnedCourse(courseId, initialOwned);

  if (owned) {
    return (
      <div className="flex items-center justify-center w-full gap-2">
        <Check size={28} className="text-green-600" />
        <span className="font-semibold">Owned</span>
      </div>
    );
  }

  return (
    <div className="flex justify-between w-full items-center">
      <div className="flex flex-col">
        <span className="text-2xl font-bold">
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(price)}
        </span>
        <span className="text-xs text-muted-foreground tracking-wide">
          One-time purchase
        </span>
      </div>

      <BuyCourseButton courseId={courseId} size="lg" className="font-bold">
        Buy Now
      </BuyCourseButton>
    </div>
  );
}
