import {
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

interface UseScrollShadowsOptions {
  /**
   * pixels from top to show shadow (default 32)
   */
  topOffset?: number;
  /**
   * pixels from bottom to hide shadow (default 32)
   */
  bottomOffset?: number;
}

/**
 * tracks whether top/bottom shadows should be shown in a scrollable container
 *
 * @template T - type of scrollable element (e.g., HTMLDivElement)
 * @example
 * const { ref: scrollRef, showTop, showBottom } = useScrollShadows<HTMLDivElement>({
 *   topOffset: 16,
 *   bottomOffset: 24,
 * });
 *
 * return (
 *   <div ref={scrollRef} className="overflow-y-auto relative h-full">
 *     <ScrollShadow position="top" show={showTop} />
 *     <ScrollShadow position="bottom" show={showBottom} />
 *   </div>
 * );
 */
export function useScrollShadows<T extends HTMLElement>({
  topOffset = 32,
  bottomOffset = 32,
}: UseScrollShadowsOptions = {}): {
  ref: RefObject<T | null>;
  showTop: boolean;
  showBottom: boolean;
} {
  const ref = useRef<T>(null);
  const [showTop, setShowTop] = useState<boolean>(false);
  const [showBottom, setShowBottom] = useState<boolean>(false);

  const updateShadows = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    const canScroll = el.scrollHeight > el.clientHeight;

    setShowTop(canScroll && el.scrollTop > topOffset);
    setShowBottom(
      canScroll &&
        el.scrollTop + el.clientHeight < el.scrollHeight - bottomOffset,
    );
  }, [topOffset, bottomOffset]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    updateShadows();

    el.addEventListener("scroll", updateShadows, { passive: true });
    window.addEventListener("resize", updateShadows);

    return () => {
      el.removeEventListener("scroll", updateShadows);
      window.removeEventListener("resize", updateShadows);
    };
  }, [updateShadows]);

  return { ref, showTop, showBottom };
}
