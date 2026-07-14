"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  confirmCheckoutOwnershipAction,
  getOwnedCourseIdsAction,
} from "@/lib/actions/ownership";
import { authClient } from "@/lib/auth/auth-client";
import {
  forgetPendingCheckoutOwnership,
  readPendingCheckoutOwnership,
} from "@/lib/ownership-client";

type OwnedCoursesContextValue = {
  isOwned: (courseId: string, fallback?: boolean) => boolean;
};

const OwnedCoursesContext = createContext<OwnedCoursesContextValue>({
  isOwned: (_courseId, fallback = false) => fallback,
});

export function OwnedCoursesProvider({
  children,
  courseIds,
}: {
  children: ReactNode;
  courseIds: string[];
}) {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;
  const [ownedIds, setOwnedIds] = useState<Set<string>>(() => new Set());
  const courseIdsKey = courseIds.join(",");
  const pathname = usePathname();

  const loadOwnedIds = useCallback(
    async (signal?: AbortSignal) => {
      if (!userId) {
        setOwnedIds(new Set());
        return;
      }

      try {
        const ids = await getOwnedCourseIdsAction();
        const nextOwnedIds = new Set(ids);
        const visibleCourseIds = courseIdsKey ? courseIdsKey.split(",") : [];
        const pendingCheckouts = readPendingCheckoutOwnership(visibleCourseIds);

        await Promise.all(
          pendingCheckouts.map(async ({ courseId, checkoutSessionId }) => {
            if (nextOwnedIds.has(courseId)) {
              forgetPendingCheckoutOwnership(checkoutSessionId);
              return;
            }

            const confirmed = await confirmCheckoutOwnershipAction(
              courseId,
              checkoutSessionId,
            );

            if (confirmed) {
              nextOwnedIds.add(courseId);
            } else {
              forgetPendingCheckoutOwnership(checkoutSessionId);
            }
          }),
        );

        if (!signal?.aborted) {
          setOwnedIds(nextOwnedIds);
        }
      } catch {
        if (!signal?.aborted) {
          setOwnedIds(new Set());
        }
      }
    },
    [courseIdsKey, userId],
  );

  useEffect(() => {
    if (pathname !== "/") return;

    const controller = new AbortController();
    loadOwnedIds(controller.signal);
    return () => {
      controller.abort();
    };
  }, [loadOwnedIds, pathname]);

  const value = useMemo<OwnedCoursesContextValue>(() => {
    const visibleCourseIds = new Set(
      courseIdsKey ? courseIdsKey.split(",") : [],
    );

    return {
      isOwned: (courseId, fallback = false) => {
        if (!visibleCourseIds.has(courseId)) return fallback;
        return ownedIds?.has(courseId) ?? fallback;
      },
    };
  }, [courseIdsKey, ownedIds]);

  return (
    <OwnedCoursesContext.Provider value={value}>
      {children}
    </OwnedCoursesContext.Provider>
  );
}

export function useOwnedCourse(courseId: string, fallback?: boolean) {
  return useContext(OwnedCoursesContext).isOwned(courseId, fallback);
}
