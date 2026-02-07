"use client";
import MuxPlayer, { type MuxPlayerRefAttributes } from "@mux/mux-player-react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  List,
  Loader2Icon,
  type LucideIcon,
  Video,
  VideoOff,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { MarkdownRenderer } from "@/components/markdown";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDuration } from "@/lib/format";
import { fetchMuxToken, RateLimitError } from "@/lib/mux-token-cache";
import { cn } from "@/lib/ui";
import type { Lesson, MuxVideo } from "@/payload-types";

interface VideoLessonProps {
  lesson: Lesson;
}
//TODO: add blur placeholder
// https://www.mux.com/docs/guides/player-customize-look-and-feel#provide-a-placeholder-while-the-poster-image-loads

export function VideoLesson({ lesson }: VideoLessonProps) {
  const video = lesson.video;
  const muxVideo = (
    video && typeof video !== "string" ? video : null
  ) as MuxVideo | null;
  const playerRef = useRef<HTMLDivElement>(null);
  const playerElementRef = useRef<MuxPlayerRefAttributes | null>(null);
  const [token, setToken] = useState<string | undefined>();
  const [isRateLimited, setIsRateLimited] = useState(false);
  const hasVideo = muxVideo?.playbackOptions?.length;

  const muxPlayerCallback = useCallback(
    (node: MuxPlayerRefAttributes | null) => {
      playerElementRef.current = node;
      if (!node || !lesson.videoChapters || lesson.videoChapters.length === 0)
        return;

      // https://www.mux.com/docs/guides/player-advanced-usage#chapters-example
      const addChaptersToPlayer = () => {
        if (!lesson.videoChapters) return;

        const chapters = lesson.videoChapters.map((chapter) => ({
          startTime: chapter.startTime,
          ...(chapter.endTime && { endTime: chapter.endTime }),
          value: chapter.title,
        }));

        if ("addChapters" in node && typeof node.addChapters === "function") {
          node.addChapters(chapters);
        }
      };

      if (
        "readyState" in node &&
        typeof node.readyState === "number" &&
        node.readyState >= 1
      ) {
        addChaptersToPlayer();
      } else {
        node.addEventListener("loadedmetadata", addChaptersToPlayer, {
          once: true,
        });
      }
    },
    [lesson.videoChapters],
  );

  useEffect(() => {
    if ("mediaSession" in navigator && muxVideo) {
      // initialize Media Session API for OS-level media controls
      // https://developer.mozilla.org/en-US/docs/Web/API/MediaMetadata
      navigator.mediaSession.metadata = new MediaMetadata({
        title: muxVideo.title || lesson.title,
        artist:
          lesson.course && typeof lesson.course !== "string"
            ? `${lesson.course.title} | Math Course Online`
            : "Math Course Online",
        album: "Course Video",
        artwork: [
          {
            src: `/api/mux/poster?url=${encodeURIComponent(muxVideo.playbackOptions?.[0]?.posterUrl || "")}`,
            sizes: "512x512",
            type: "image/png",
          },
        ],
      });
    }
  }, [muxVideo, lesson.title, lesson.course]);

  useEffect(() => {
    if (!muxVideo?.playbackOptions?.length) return;

    const playback = muxVideo.playbackOptions[0];
    const playbackId = playback.playbackId;
    const isSigned = playback.playbackPolicy === "signed";
    const isFree = lesson.free || false;

    if (!playbackId || !isSigned) return;

    let mounted = true;

    fetchMuxToken(playbackId, isFree)
      .then((t) => {
        if (mounted) {
          setToken(t);
          setIsRateLimited(false);
        }
      })
      .catch((err) => {
        if (!mounted) return;

        if (err instanceof RateLimitError) {
          setIsRateLimited(true);
          toast.error("Rate limit exceeded. Please try again later.");
        } else {
          toast.error(`Failed to fetch token: ${err.message}`);
        }
        console.error("Error fetching mux token:", err);
      });

    return () => {
      mounted = false;
    };
  }, [muxVideo, lesson.free]);

  const handleTimestampClick = (startTime: number) => {
    const player = playerElementRef.current;
    if (player && "currentTime" in player) {
      player.currentTime = startTime;
      player.play();
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: "instant" });
      });
    }
  };

  const renderVideoArea = () => {
    const playback = muxVideo?.playbackOptions?.[0];

    const EmptyState = ({
      icon: Icon,
      title,
      description,
      variant = "muted",
    }: {
      icon: LucideIcon;
      title: string;
      description?: string;
      variant?: "muted" | "destructive";
    }) => (
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-muted dark:bg-card/80 flex items-center justify-center">
        {playback?.posterUrl && (
          <Image
            src={`/api/mux/poster?url=${encodeURIComponent(playback.posterUrl)}`}
            alt={lesson.title}
            fill
            className="object-cover blur-lg scale-110 opacity-40"
          />
        )}
        <div className="absolute inset-0 bg-muted/60 dark:bg-card/60" />
        <div className="relative z-10 flex flex-col items-center justify-center gap-4 p-8 text-center max-w-md">
          <div
            className={cn(
              "p-6 rounded-full",
              variant === "destructive"
                ? "bg-destructive/10"
                : "bg-muted-foreground/10",
            )}
          >
            <Icon
              className={cn(
                "w-12 h-12",
                variant === "destructive"
                  ? "text-destructive"
                  : "text-muted-foreground",
              )}
            />
          </div>
          <h3
            className={cn(
              "text-lg font-semibold",
              variant === "destructive" && "text-destructive",
            )}
          >
            {title}
          </h3>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
    );

    if (!hasVideo || !playback) {
      return <EmptyState icon={VideoOff} title="No video available" />;
    }

    if (isRateLimited) {
      return (
        <EmptyState
          icon={AlertCircle}
          title="Rate Limited"
          description="Too many requests. Please wait a minute and try again."
          variant="destructive"
        />
      );
    }

    const { playbackId = "" } = playback;

    if (!token) {
      return (
        <div className="w-full aspect-video rounded-xl overflow-hidden bg-background flex items-center justify-center">
          <Loader2Icon className="animate-spin size-[90px] text-foreground/10" />
        </div>
      );
    }

    return (
      <motion.div
        initial={{
          scale: 0.94,
          opacity: 0.6,
        }}
        animate={{
          scale: 1,
          opacity: 1,
        }}
        transition={{
          duration: 0.2,
        }}
      >
        <MuxPlayer
          ref={muxPlayerCallback}
          playbackId={playbackId || undefined}
          tokens={{ playback: token }}
          poster={
            playback.posterUrl
              ? `/api/mux/poster?url=${encodeURIComponent(playback.posterUrl)}`
              : undefined
          }
          title=""
          videoTitle={muxVideo.title || lesson.title}
          accentColor="#4E65FF"
          proudlyDisplayMuxBadge
          metadata={{
            video_title: muxVideo.title,
            video_id: muxVideo.id,
            lesson_id: lesson.id,
          }}
          onError={(e) => console.log(e)}
          preload="metadata"
          streamType="on-demand"
          autoPlay={false}
          className="rounded-xl w-full overflow-hidden bg-background aspect-video"
        />
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col gap-4" ref={playerRef}>
      {renderVideoArea()}

      <Card className="mt-2 bg-card/40 shadow-none">
        <CardHeader className="border-b font-inter">
          <CardTitle className="flex items-center gap-3 -mb-2">
            <Video className="size-5 text-primary" />
            Video Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lesson.videoDescription ? (
            <MarkdownRenderer
              content={lesson.videoDescription}
              optimizeMath={
                !lesson.free || process.env.NODE_ENV === "development"
              }
            />
          ) : (
            <p className="italic text-muted-foreground">No Description</p>
          )}
          {lesson.videoChapters && lesson.videoChapters.length > 0 && (
            <>
              <Separator className="mt-4" />
              <div className="mt-4 font-inter">
                <h3 className="text-lg font-semibold mb-4 text-primary flex items-center gap-2">
                  <List className="size-5" />
                  Chapters
                </h3>
                <ul className=" space-y-2 sm:space-y-1">
                  {lesson.videoChapters.map((chapter, index) => (
                    <li
                      key={chapter.id || index}
                      className="flex items-center gap-2"
                    >
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => handleTimestampClick(chapter.startTime)}
                        className="text-primary text-md p-0 shrink-0 hover:underline disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed disabled:no-underline"
                        disabled={!hasVideo || isRateLimited}
                      >
                        {formatDuration(chapter.startTime)}
                      </Button>
                      <span>&ndash;</span>
                      <span className="truncate font-semibold">
                        {chapter.title}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
