let activeScrollRun = 0;

interface ScrollToHeaderOptions {
  behavior?: ScrollBehavior;
  maxAttempts?: number;
  attemptInterval?: number;
  /**
   * forces scrolling even if the element's position hasn't changed
   * @default false
   */
  force?: boolean;
}

export function scrollToHeader(
  id: string,
  {
    behavior = "instant",
    maxAttempts = 4,
    attemptInterval = 100,
    force = false,
  }: ScrollToHeaderOptions = {},
) {
  const el = document.getElementById(id);
  if (!el) return;

  // invalidate any previous scroll runs
  const runId = ++activeScrollRun;

  // invalidate if user scrolls manually
  cancelOnUserScroll(runId);

  el.scrollIntoView({ behavior, block: "start" });
  history.replaceState(null, "", `#${id}`);

  let attemptCount = 0;

  const checkAndAdjust = () => {
    if (runId !== activeScrollRun) return;

    if (behavior === "smooth") return;

    const rect = el.getBoundingClientRect();
    const scrollMargin = parseFloat(
      getComputedStyle(el).scrollMarginTop || "0",
    );
    const targetScrollY = window.scrollY + rect.top - scrollMargin;

    // scroll if the element moved (lazy content shifted it)
    if (Math.abs(targetScrollY - window.scrollY) > 1 || force) {
      window.scrollTo({ top: targetScrollY, behavior: "instant" });

      attemptCount++;

      if (attemptCount < maxAttempts) {
        setTimeout(checkAndAdjust, attemptInterval);
      }
    }
  };

  requestAnimationFrame(() => {
    setTimeout(checkAndAdjust, attemptInterval);
  });
}

function cancelOnUserScroll(runId: number) {
  const events: (keyof WindowEventMap)[] = ["wheel", "touchmove", "keydown"];

  const cancel = () => {
    if (runId === activeScrollRun) {
      activeScrollRun++;
    }

    events.forEach((event) => {
      window.removeEventListener(event, cancel);
    });
  };

  events.forEach((event) => {
    window.addEventListener(event, cancel, { passive: true });
  });
}
