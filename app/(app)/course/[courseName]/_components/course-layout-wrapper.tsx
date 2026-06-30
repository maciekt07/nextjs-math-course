"use client";

import { motion, useReducedMotion } from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { confirmCheckoutOwnershipAction } from "@/lib/actions/ownership";
import {
  forgetPendingCheckoutOwnership,
  rememberPendingCheckoutOwnership,
} from "@/lib/checkout-ownership-client";
import { useCourseStore } from "@/stores/course-store";
import { useSidebarStore } from "@/stores/sidebar-store";
import type { Chapter, Course, Lesson } from "@/types/payload-types";
import { CourseSidebar } from "./sidebar";

const CHECKOUT_REFRESH_DELAYS_MS = [1500, 4000, 8000];

function cleanCheckoutUrl() {
  const url = new URL(window.location.href);
  url.searchParams.delete("payment_success");
  url.searchParams.delete("session_id");
  url.searchParams.delete("canceled");
  window.history.replaceState(window.history.state, "", url.toString());
}

export function CourseLayoutWrapper({
  course,
  lessons,
  chapters,
  owned,
  children,
}: {
  course: Course;
  lessons: Lesson[];
  chapters: Chapter[];
  owned?: boolean;
  children: React.ReactNode;
}) {
  const open = useSidebarStore((state) => state.open);
  const setOpen = useSidebarStore((state) => state.setOpen);
  const setOptimisticPath = useSidebarStore((state) => state.setOptimisticPath);
  const initialize = useCourseStore((state) => state.initialize);
  const prefersReducedMotion = useReducedMotion();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ownedOverride, setOwnedOverride] = useState<boolean | null>(null);
  const effectiveOwned = ownedOverride ?? owned;
  const handledCheckoutRef = useRef<string | null>(null);
  const mountedRef = useRef(false);
  const refreshTimersRef = useRef<number[]>([]);

  useEffect(() => {
    initialize(course, lessons);
  }, [initialize, course, lessons]);

  useEffect(() => {
    return () => {
      setOptimisticPath(null);
      setOpen(true);
    };
  }, [setOptimisticPath, setOpen]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset checkout optimism when the course changes
  useEffect(() => {
    setOwnedOverride(null);
    handledCheckoutRef.current = null;
    for (const timer of refreshTimersRef.current) window.clearTimeout(timer);
    refreshTimersRef.current = [];
  }, [course.id]);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      for (const timer of refreshTimersRef.current) window.clearTimeout(timer);
      refreshTimersRef.current = [];
    };
  }, []);

  useEffect(() => {
    const paymentSuccess = searchParams.get("payment_success");
    const sessionId = searchParams.get("session_id");
    const canceled = searchParams.get("canceled");

    if (canceled) {
      setOwnedOverride(null);
      cleanCheckoutUrl();
      return;
    }

    if (
      paymentSuccess &&
      sessionId &&
      handledCheckoutRef.current !== sessionId
    ) {
      handledCheckoutRef.current = sessionId;
      rememberPendingCheckoutOwnership(course.id, sessionId);

      confirmCheckoutOwnershipAction(course.id, sessionId).then((confirmed) => {
        if (!mountedRef.current || handledCheckoutRef.current !== sessionId) {
          return;
        }

        if (confirmed) {
          setOwnedOverride(true);

          for (const timer of refreshTimersRef.current) {
            window.clearTimeout(timer);
          }

          refreshTimersRef.current = [
            ...CHECKOUT_REFRESH_DELAYS_MS.map((delay) =>
              window.setTimeout(() => {
                router.refresh();
              }, delay),
            ),
            window.setTimeout(
              () => {
                cleanCheckoutUrl();
              },
              Math.max(...CHECKOUT_REFRESH_DELAYS_MS) + 250,
            ),
          ];

          router.refresh();
        } else {
          setOwnedOverride(null);
          forgetPendingCheckoutOwnership(sessionId);
          cleanCheckoutUrl();
          router.refresh();
        }
      });
    } else if (paymentSuccess || sessionId) {
      setOwnedOverride(null);
      cleanCheckoutUrl();
    }
  }, [course.id, router, searchParams]);

  return (
    <div className="flex flex-col md:flex-row min-h-screen relative overflow-x-hidden">
      <motion.div
        data-open={open}
        className="hidden md:block shrink-0 overflow-hidden"
        initial={false}
        animate={{ width: open ? 320 : 0 }}
        transition={{
          type: "tween",
          duration: prefersReducedMotion ? 0 : 0.2,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
        style={{ willChange: "width" }}
      />

      <CourseSidebar
        course={course}
        lessons={lessons}
        chapters={chapters}
        owned={effectiveOwned}
      />

      <motion.div className="flex-1 flex flex-col min-w-0">
        <motion.main
          data-open={open}
          className="flex-1 w-full min-w-0"
          initial={false}
          animate={{ paddingTop: open ? 0 : 68 }}
          transition={{
            type: "tween",
            duration: prefersReducedMotion ? 0 : 0.2,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          style={{ willChange: "padding-top" }}
        >
          {children}
        </motion.main>
      </motion.div>
    </div>
  );
}
