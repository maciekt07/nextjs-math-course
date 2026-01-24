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

  el.scrollIntoView({ behavior, block: "start" });

  let attemptCount = 0;

  const checkAndAdjust = () => {
    if (behavior === "smooth") return;
    const rect = el.getBoundingClientRect();
    const scrollMargin = parseFloat(
      getComputedStyle(el).scrollMarginTop || "0",
    );
    const targetScrollY = window.scrollY + rect.top - scrollMargin;

    // only scroll if the element moved (lazy content shifted it)
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

  history.replaceState(null, "", `#${id}`);
}
