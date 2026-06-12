"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  AnimateIcon,
  type StaticAnimations,
} from "@/components/animate-ui/icons/icon";
import {
  Lock,
  animations as lockAnimations,
} from "@/components/animate-ui/icons/lock";
import { LogIn } from "@/components/animate-ui/icons/log-in";
import BuyCourseButton from "@/components/buy-course-button";
import { EmptyStateCenterWrapper } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { useMounted } from "@/hooks/use-mounted";
import { cn } from "@/lib/ui";

type LockAnimation = keyof typeof lockAnimations | StaticAnimations;
type LockState = "locked" | "unlocked";

const UNLOCK_DURATION =
  lockAnimations.unlock.group.animate.transition.duration * 1000;

const LOCK_DURATION =
  lockAnimations.lock.group.animate.transition.duration * 1000;

export interface LockedLessonPreview {
  title: string;
  slug: string;
  courseId: string;
}

interface LockedLessonProps {
  lesson: LockedLessonPreview;
  courseName: string;
  showSignIn: boolean;
}

export function LockedLesson({
  lesson,
  courseName,
  showSignIn,
}: LockedLessonProps) {
  const mounted = useMounted();

  const [animation, setAnimation] = useState<LockAnimation>("path");
  const [key, setKey] = useState<number>(0);

  const isAnimatingRef = useRef<boolean>(false);
  const disabledRef = useRef<boolean>(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentStateRef = useRef<LockState>("locked");
  const desiredStateRef = useRef<LockState>("locked");

  const startAnimation = (nextState: LockState) => {
    if (disabledRef.current) return;
    if (currentStateRef.current === nextState) return;

    const nextAnimation: LockAnimation =
      nextState === "unlocked" ? "unlock" : "lock";

    isAnimatingRef.current = true;

    setAnimation(nextAnimation);
    setKey((k) => k + 1);

    const duration =
      nextAnimation === "unlock" ? UNLOCK_DURATION : LOCK_DURATION;

    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      isAnimatingRef.current = false;
      currentStateRef.current = nextState;

      if (
        !disabledRef.current &&
        desiredStateRef.current !== currentStateRef.current
      ) {
        startAnimation(desiredStateRef.current);
      }
    }, duration);
  };

  const requestState = (nextState: LockState) => {
    if (disabledRef.current) return;

    desiredStateRef.current = nextState;

    if (!isAnimatingRef.current) {
      startAnimation(nextState);
    }
  };

  const handleMouseEnter = () => requestState("unlocked");
  const handleMouseLeave = () => requestState("locked");

  const handleClick = () => {
    disabledRef.current = true;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    isAnimatingRef.current = false;
    desiredStateRef.current = currentStateRef.current;
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const buttonProps: React.ComponentPropsWithoutRef<"button"> = {
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onClick: handleClick,
  };

  return (
    <EmptyStateCenterWrapper>
      <div className="flex flex-col items-center text-center space-y-6 max-w-130">
        <div className="mx-auto w-24 h-24 flex items-center justify-center bg-orange-600/10 dark:bg-orange-500/10 rounded-full">
          <AnimateIcon key={key} animate={animation} completeOnStop>
            <Lock
              size={48}
              className={cn(
                "text-orange-600 dark:text-orange-500",
                !mounted && "text-transparent!",
              )}
            />
          </AnimateIcon>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">{lesson.title}</h1>
          <h2 className="text-muted-foreground">
            This is a premium lesson. You need to own a full course to access
            it.
          </h2>
        </div>
        {showSignIn ? (
          <AnimateIcon animateOnHover className="w-full">
            <Button size="lg" className="w-full" asChild {...buttonProps}>
              <Link
                href={{
                  pathname: "/auth/sign-in",
                  query: { returnTo: `/course/${courseName}/${lesson.slug}` },
                }}
              >
                <LogIn className="h-4 w-4" />
                Sign in to continue
              </Link>
            </Button>
          </AnimateIcon>
        ) : (
          <BuyCourseButton
            courseId={lesson.courseId}
            size="lg"
            className="w-full"
            {...buttonProps}
          >
            Buy Course
          </BuyCourseButton>
        )}
      </div>
    </EmptyStateCenterWrapper>
  );
}
