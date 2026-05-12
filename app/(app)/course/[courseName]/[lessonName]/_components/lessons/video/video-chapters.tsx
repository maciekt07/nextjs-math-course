"use client";

import {
  ChevronLeft,
  ChevronRight,
  Clock3,
  List,
  Play,
  Video,
} from "lucide-react";
import {
  AnimatePresence,
  type HTMLMotionProps,
  motion,
  useReducedMotion,
} from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDuration } from "@/lib/format";
import { cn } from "@/lib/ui";
import type { Lesson } from "@/types/payload-types";

type VideoChapter = NonNullable<Lesson["videoChapters"]>[number];

interface VideoChaptersProps {
  playbackId?: string | null;
  chapterThumbnailTokens?: Array<{ startTime: number; token: string }>;
  currentTime: number;
  hasVideo: boolean;
  isRateLimited: boolean;
  placeholder?: string;
  videoDuration?: number | null;
  videoChapters: VideoChapter[];
  onChapterSelect: (startTime: number) => void;
  tokensReady?: boolean;
}

const CARD_WIDTH = 260;
const SCROLL_STEP = CARD_WIDTH + 16;

export function VideoChapters({
  playbackId,
  chapterThumbnailTokens,
  currentTime,
  hasVideo,
  isRateLimited,
  placeholder,
  videoDuration,
  videoChapters,
  onChapterSelect,
  tokensReady,
}: VideoChaptersProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState<boolean>(false);
  const [canScrollRight, setCanScrollRight] = useState<boolean>(false);

  const normalizedChapters = useMemo(() => {
    return [...videoChapters]
      .sort((a, b) => a.startTime - b.startTime)
      .map((chapter, index, chapters) => ({
        ...chapter,
        resolvedEndTime:
          chapter.endTime ??
          chapters[index + 1]?.startTime ??
          videoDuration ??
          undefined,
      }));
  }, [videoChapters, videoDuration]);

  const activeChapterIndex = useMemo(() => {
    if (!normalizedChapters.length) return -1;

    return normalizedChapters.findIndex((chapter, index) => {
      const nextStart =
        normalizedChapters[index + 1]?.startTime ?? Number.POSITIVE_INFINITY;
      const endTime = chapter.resolvedEndTime ?? nextStart;
      return currentTime >= chapter.startTime && currentTime < endTime;
    });
  }, [currentTime, normalizedChapters]);

  const updateScrollState = useCallback(() => {
    const node = scrollRef.current;
    if (!node) return;

    const maxScrollLeft = node.scrollWidth - node.clientWidth;
    setCanScrollLeft(node.scrollLeft > 8);
    setCanScrollRight(node.scrollLeft < maxScrollLeft - 8);
  }, []);

  useEffect(() => {
    updateScrollState();

    const node = scrollRef.current;
    if (!node) return;

    node.addEventListener("scroll", updateScrollState, { passive: true });

    const resizeObserver = new ResizeObserver(() => {
      updateScrollState();
    });

    resizeObserver.observe(node);

    return () => {
      node.removeEventListener("scroll", updateScrollState);
      resizeObserver.disconnect();
    };
  }, [updateScrollState]);

  const handleScrollBy = (direction: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: direction === "left" ? -SCROLL_STEP : SCROLL_STEP,
      behavior: "smooth",
    });
  };

  return (
    <div className="mt-4 -mb-2 font-inter">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <List className="size-5" />
          Chapters
        </h3>
      </div>

      <div className="relative">
        <ScrollButton
          show={canScrollLeft}
          direction="left"
          onClick={() => handleScrollBy("left")}
        />

        <ScrollButton
          show={canScrollRight}
          direction="right"
          onClick={() => handleScrollBy("right")}
        />

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-3 pt-1 scroll-smooth"
        >
          {normalizedChapters.map((chapter, index) => {
            const isActive = index === activeChapterIndex && currentTime !== 0;

            const chapterToken = chapterThumbnailTokens?.find(
              (t) => Math.abs(t.startTime - chapter.startTime) < 0.1,
            )?.token;

            const chapterThumbnailUrl = getMuxChapterThumbnailUrl({
              playbackId,
              startTime: chapter.startTime,
              token: chapterToken ?? null,
            });

            const chapterLength =
              chapter.resolvedEndTime &&
              chapter.resolvedEndTime > chapter.startTime
                ? formatDuration(chapter.resolvedEndTime - chapter.startTime)
                : null;

            return (
              <button
                type="button"
                key={`${chapter.startTime}-${chapter.title}`}
                onClick={() => onChapterSelect(chapter.startTime)}
                disabled={!hasVideo || isRateLimited}
                className={cn(
                  `flex min-w-[${CARD_WIDTH}px] max-w-[${CARD_WIDTH}px]`,
                  "group relative snap-start flex-col overflow-hidden rounded-2xl border bg-card text-left shadow-sm transition-all duration-200 cursor-pointer",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  isActive && "border-primary/60 ring-1 ring-primary/30",
                )}
              >
                <div className="relative aspect-video overflow-hidden bg-muted">
                  {placeholder ? (
                    // biome-ignore lint/performance/noImgElement: blur placeholder
                    <img
                      src={placeholder}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 h-full w-full scale-110 object-cover opacity-70 blur-sm"
                    />
                  ) : null}
                  {chapterThumbnailUrl && tokensReady ? (
                    <Image
                      src={chapterThumbnailUrl}
                      alt={`${chapter.title} preview`}
                      fill
                      loading="lazy"
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      sizes={`(max-width: 640px) 72vw, ${CARD_WIDTH}px`}
                      placeholder={placeholder ? "blur" : "empty"}
                      blurDataURL={placeholder}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                      <Video className="size-8 opacity-60" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/20 dark:from-background/90 via-background/15 to-transparent" />
                  <div className="absolute left-3 top-3">
                    <Badge
                      variant="outline"
                      className="backdrop-blur-sm border-1 border-border/40 dark:border-border bg-card/70"
                    >
                      {formatDuration(chapter.startTime)}
                    </Badge>
                  </div>
                  <div
                    className={cn(
                      "pointer-events-none border border-border/40 dark:border-border absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 text-sm rounded-full bg-card/70 px-4 py-2 font-medium text-foreground opacity-0 shadow-sm blur-sm",
                      "transition-[opacity,filter,transform] duration-200 ease-out backdrop-blur-md group-hover:opacity-100 group-hover:blur-none group-focus-visible:translate-y-0 group-focus-visible:opacity-100 group-focus-visible:blur-none motion-reduce:transition-none",
                    )}
                  >
                    <Play className="size-3.5 fill-current" />
                    Jump
                  </div>
                </div>

                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div className="space-y-1">
                    <div className="line-clamp-2 text-sm font-semibold leading-5 text-foreground">
                      {chapter.title}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock3 className="size-3.5" />
                      <span>Starts at {formatDuration(chapter.startTime)}</span>
                    </div>
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-3 text-xs text-muted-foreground">
                    <span>
                      {chapterLength
                        ? `${chapterLength} segment`
                        : "Chapter marker"}
                    </span>
                    <span
                      className={cn("font-medium", isActive && "text-primary")}
                    >
                      {isActive ? "Now playing" : `Chapter ${index + 1}`}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function VideoChaptersSkeleton() {
  return (
    <div className="mt-4 -mb-2 font-inter">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <List className="size-5" />
          Chapters
        </h3>
      </div>

      <div className="relative">
        <div className="flex gap-4 overflow-x-hidden pb-3 pt-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
              key={i}
              className="relative flex min-w-[260px] max-w-[260px] flex-col overflow-hidden rounded-2xl border bg-card shadow-sm"
            >
              {/* thumbnail */}
              <div className="relative aspect-video bg-muted">
                <Skeleton className="absolute inset-0 h-full w-full rounded-none" />
                <div className="absolute left-3 top-3">
                  <Skeleton className="h-5 w-11 rounded-full" />
                </div>
              </div>

              <div className="absolute left-3 top-3">
                <Badge
                  className={cn(
                    "backdrop-blur-sm border-1 border-border/40 dark:border-border bg-card/70 animate-pulse",
                  )}
                >
                  <span className="text-transparent select-none">0:00</span>
                </Badge>
              </div>

              {/* content */}
              <div className="flex flex-1 flex-col gap-2.5 p-4 mt-1.5">
                {/* title lines */}
                <div className="space-y-[5px]">
                  <Skeleton className="h-3.5 w-[85%]" />
                </div>

                {/* starts at */}
                <div className="flex items-center gap-1.5">
                  <Skeleton className="h-3 w-[110px]" />
                </div>

                {/* bottom row */}
                <div className="flex items-center justify-between mt-1">
                  <Skeleton className="h-3 w-[90px]" />
                  <Skeleton className="h-3 w-[70px]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ScrollButton({
  show,
  direction,
  onClick,
}: {
  show: boolean;
  direction: "left" | "right";
  onClick: () => void;
}) {
  const isLeft = direction === "left";
  const fromX = (isLeft ? -1 : 1) * 20;
  const prefersReducedMotion = useReducedMotion();

  const motionProps: HTMLMotionProps<"div"> = prefersReducedMotion
    ? {}
    : {
        initial: { scale: 0, x: fromX },
        animate: { scale: 1, x: 0 },
        exit: { scale: 0, x: fromX },
        transition: { duration: 0.15 },
      };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key={`chapter-scroll-${direction}`}
          {...motionProps}
          className={cn(
            "absolute top-1/2 z-10 -translate-y-1/2",
            "hidden [@media(hover:hover)_and_(pointer:fine)]:block",
            isLeft ? "left-2" : "right-2",
          )}
        >
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onClick}
            className="rounded-full bg-card/90 backdrop-blur-md shadow-md cursor-pointer"
            aria-label={`Scroll ${direction}`}
          >
            {isLeft ? (
              <ChevronLeft className="size-6" />
            ) : (
              <ChevronRight className="size-6" />
            )}
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function getMuxChapterThumbnailUrl({
  playbackId,
  startTime,
  token,
}: {
  playbackId?: string | null;
  startTime: number;
  token?: string | null;
}) {
  if (!playbackId) return null;

  const params = new URLSearchParams({
    time: startTime.toString(),
    width: "480",
    fit_mode: "preserve",
  });

  if (token) {
    params.set("token", token);
  }

  return `https://image.mux.com/${playbackId}/thumbnail.webp?${params.toString()}`;
}
