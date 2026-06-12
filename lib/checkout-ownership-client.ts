"use client";

type PendingCheckoutOwnership = {
  courseId: string;
  checkoutSessionId: string;
  expiresAt: number;
};

const STORAGE_KEY = "math-course-online:pending-checkout-ownership";
const TTL_MS = 15 * 60 * 1000;

function clearPendingCheckoutOwnership() {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {}
}

function writePendingCheckoutOwnership(items: PendingCheckoutOwnership[]) {
  if (typeof window === "undefined") return;

  try {
    if (items.length === 0) {
      window.sessionStorage.removeItem(STORAGE_KEY);
      return;
    }

    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

function readAllPendingCheckoutOwnership() {
  if (typeof window === "undefined") return [];

  try {
    const value = window.sessionStorage.getItem(STORAGE_KEY);
    const items = value ? JSON.parse(value) : [];
    const now = Date.now();

    if (!Array.isArray(items)) {
      clearPendingCheckoutOwnership();
      return [];
    }

    const validItems = items.filter(
      (item): item is PendingCheckoutOwnership =>
        typeof item?.courseId === "string" &&
        typeof item?.checkoutSessionId === "string" &&
        typeof item?.expiresAt === "number" &&
        item.expiresAt > now,
    );

    if (validItems.length !== items.length) {
      writePendingCheckoutOwnership(validItems);
    }

    return validItems;
  } catch {
    clearPendingCheckoutOwnership();
    return [];
  }
}

export function rememberPendingCheckoutOwnership(
  courseId: string,
  checkoutSessionId: string,
) {
  const pending = readAllPendingCheckoutOwnership().filter(
    (item) => item.checkoutSessionId !== checkoutSessionId,
  );

  pending.push({
    courseId,
    checkoutSessionId,
    expiresAt: Date.now() + TTL_MS,
  });

  writePendingCheckoutOwnership(pending);
}

export function readPendingCheckoutOwnership(courseIds: string[]) {
  const visibleIds = new Set(courseIds);
  return readAllPendingCheckoutOwnership().filter((item) =>
    visibleIds.has(item.courseId),
  );
}

export function forgetPendingCheckoutOwnership(checkoutSessionId: string) {
  writePendingCheckoutOwnership(
    readAllPendingCheckoutOwnership().filter(
      (item) => item.checkoutSessionId !== checkoutSessionId,
    ),
  );
}
