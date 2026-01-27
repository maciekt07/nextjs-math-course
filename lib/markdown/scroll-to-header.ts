let activeScrollRun = 0;

interface ScrollToHeaderOptions {
  behavior?: ScrollBehavior;
  timeout?: number;
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
    timeout = 3000,
    force = false,
  }: ScrollToHeaderOptions = {},
) {
  const el = document.getElementById(id);
  if (!el) return;

  const runId = ++activeScrollRun;

  history.replaceState(null, "", `#${id}`);

  cancelOnSidebarToggle(runId);

  cancelOnUserScroll(runId);

  if (behavior === "smooth") {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  let lastPosition = -1;
  let stableChecks = 0;
  const startTime = Date.now();
  let rafId: number | null = null;
  let intersectionObserver: IntersectionObserver | null = null;
  let checksPending = 0;

  const performScroll = (): number => {
    if (runId !== activeScrollRun) return -1;

    const rect = el.getBoundingClientRect();
    const scrollMargin = parseFloat(
      getComputedStyle(el).scrollMarginTop || "0",
    );
    const targetScrollY = window.scrollY + rect.top - scrollMargin;

    if (Math.abs(targetScrollY - window.scrollY) > 1 || force) {
      window.scrollTo({ top: targetScrollY, behavior: "instant" });
    }

    return rect.top;
  };

  const cleanup = () => {
    if (intersectionObserver) {
      intersectionObserver.disconnect();
      intersectionObserver = null;
    }
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };

  const checkPosition = () => {
    if (runId !== activeScrollRun) {
      cleanup();
      return;
    }

    if (Date.now() - startTime > timeout) {
      cleanup();
      return;
    }

    const currentPosition = performScroll();

    if (currentPosition === -1) {
      cleanup();
      return;
    }

    if (Math.abs(currentPosition - lastPosition) < 1) {
      stableChecks++;
      // wait until all pending lazy renders complete and position is stable
      if (stableChecks >= 3 && checksPending === 0) {
        cleanup();
        return;
      }
    } else {
      stableChecks = 0;
    }

    lastPosition = currentPosition;
    rafId = requestAnimationFrame(checkPosition);
  };

  const katexElements = Array.from(
    document.querySelectorAll(".katex, [data-katex]"),
  );

  const potentialLazyElements = Array.from(
    el.parentElement?.querySelectorAll("div, span") || [],
  ).filter((elem) => {
    const htmlElem = elem as HTMLElement;
    return !htmlElem.dataset.value && elem.childElementCount === 0;
  });

  const allElements = [...katexElements, ...potentialLazyElements];

  if (allElements.length > 0) {
    checksPending = allElements.length;

    // watch for when lazy rendered katex elements actually render
    intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const elem = entry.target as HTMLElement;
          if (elem.dataset.value || elem.querySelector(".katex")) {
            checksPending = Math.max(0, checksPending - 1);
            intersectionObserver?.unobserve(elem);
          }
        });
      },
      { rootMargin: "500px" },
    );

    allElements.forEach((elem) => {
      const htmlElem = elem as HTMLElement;
      // already rendered
      if (htmlElem.dataset.value || elem.querySelector(".katex")) {
        checksPending = Math.max(0, checksPending - 1);
      } else {
        intersectionObserver?.observe(elem);
      }
    });
  }

  performScroll();
  rafId = requestAnimationFrame(checkPosition);
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

function cancelOnSidebarToggle(runId: number) {
  const aside = document.querySelector("aside");
  if (!aside) return;

  const observer = new MutationObserver(() => {
    if (runId === activeScrollRun) {
      activeScrollRun++;
    }
    observer.disconnect();
  });

  observer.observe(aside, {
    attributes: true,
    attributeFilter: ["data-open"],
  });
}
