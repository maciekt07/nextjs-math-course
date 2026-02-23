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
import type React from "react";
import { useCallback, useEffect, useReducer, useRef } from "react";
import { toast } from "sonner";
import { MarkdownRenderer } from "@/components/markdown";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useMounted } from "@/hooks/use-mounted";
import { formatDuration } from "@/lib/format";
import { fetchMuxToken, RateLimitError } from "@/lib/mux-token-cache";
import { cn } from "@/lib/ui";
import type { MuxTokens } from "@/types/mux";
import type { Course, Lesson, MuxVideo } from "@/types/payload-types";

type PlaybackOption = NonNullable<MuxVideo["playbackOptions"]>[number];

interface VideoPlayerProps
  extends Pick<
    Lesson,
    "videoChapters" | "free" | "videoDescription" | "id" | "title"
  > {
  playbackId: PlaybackOption["playbackId"];
  playbackPolicy: PlaybackOption["playbackPolicy"];
  placeholder: string | undefined;
  posterUrl: PlaybackOption["posterUrl"];
  hasVideo: boolean;
  videoTitle: Lesson["title"];
  videoId: MuxVideo["id"];
  course: Course;
}

export function VideoPlayer({
  playbackId,
  playbackPolicy,
  posterUrl,
  placeholder,
  hasVideo,
  videoId,
  videoTitle,
  videoChapters,
  id,
  title,
  videoDescription,
  free,
  course,
}: VideoPlayerProps) {
  const mounted = useMounted();
  const playerRef = useRef<HTMLDivElement>(null);
  const playerElementRef = useRef<MuxPlayerRefAttributes | null>(null);

  type MuxState = {
    tokens: Partial<MuxTokens>;
    isRateLimited: boolean;
  };

  type Action =
    | { type: "SET_TOKENS"; tokens: Partial<MuxTokens> }
    | { type: "SET_RATE_LIMITED"; value: boolean };

  function reducer(state: MuxState, action: Action): MuxState {
    switch (action.type) {
      case "SET_TOKENS":
        return { ...state, tokens: action.tokens, isRateLimited: false };
      case "SET_RATE_LIMITED":
        return { ...state, isRateLimited: action.value };
      default:
        return state;
    }
  }

  const [state, dispatch] = useReducer(reducer, {
    tokens: {},
    isRateLimited: false,
  });

  const muxPlayerCallback = useCallback(
    (node: MuxPlayerRefAttributes | null) => {
      playerElementRef.current = node;
      if (!node || !videoChapters || videoChapters.length === 0) return;

      // https://www.mux.com/docs/guides/player-advanced-usage#chapters-example
      const addChaptersToPlayer = () => {
        if (!videoChapters) return;

        const chapters = videoChapters.map((chapter) => ({
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
    [videoChapters],
  );

  useEffect(() => {
    if ("mediaSession" in navigator) {
      // initialize Media Session API for OS-level media controls
      // https://developer.mozilla.org/en-US/docs/Web/API/MediaMetadata
      navigator.mediaSession.metadata = new MediaMetadata({
        title: videoTitle || title,
        artist:
          course && typeof course !== "string"
            ? `${course.title} | Math Course Online`
            : "Math Course Online",
        album: "Course Video",
        artwork: [
          {
            src: posterUrl ? `${posterUrl}` : "",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      });
    }
  }, [course, posterUrl, title, videoTitle]);

  useEffect(() => {
    if (!hasVideo) return;
    if (playbackPolicy === "public") return;

    const isSigned = playbackPolicy === "signed";

    if (!playbackId || !isSigned) return;

    let mounted = true;
    fetchMuxToken(playbackId)
      .then((t) => {
        if (mounted) {
          dispatch({
            type: "SET_TOKENS",
            tokens: { playback: t.playback, storyboard: t.storyboard },
          });
        }
      })
      .catch((err) => {
        if (!mounted) return;
        if (err instanceof RateLimitError) {
          dispatch({ type: "SET_RATE_LIMITED", value: true });
          toast.error("Rate limit exceeded. Please try again later.");
        } else {
          toast.error(`Failed to fetch token: ${err.message}`);
        }
        console.error("Error fetching mux token:", err);
      });

    return () => {
      mounted = false;
    };
  }, [playbackId, playbackPolicy, hasVideo]);

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
    if (!hasVideo || !playbackId) {
      return <EmptyState icon={VideoOff} title="No video available" />;
    }
    // SSR placeholder
    if (!mounted) {
      return <EmptyState className="bg-transparent" />;
    }

    if (state.isRateLimited) {
      return (
        <EmptyState
          icon={AlertCircle}
          title="Rate Limited"
          description="Too many requests. Please wait a minute and try again."
          variant="destructive"
        />
      );
    }

    if (!state.tokens.playback && playbackPolicy === "signed") {
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
          tokens={playbackPolicy === "signed" ? state.tokens : undefined}
          poster={posterUrl ?? undefined}
          placeholder={placeholder}
          title=""
          videoTitle={videoTitle || title}
          accentColor="#4E65FF"
          proudlyDisplayMuxBadge
          metadata={{
            video_title: videoTitle,
            video_id: videoId,
            lesson_id: id,
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
          {videoDescription ? (
            <MarkdownRenderer
              content={videoDescription}
              optimizeMath={!free || process.env.NODE_ENV === "development"}
            />
          ) : (
            <p className="italic text-muted-foreground">No Description</p>
          )}
          {videoChapters && videoChapters.length > 0 && (
            <>
              <Separator className="mt-4" />
              <div className="mt-4 font-inter">
                <h3 className="text-lg font-semibold mb-4 text-primary flex items-center gap-2">
                  <List className="size-5" />
                  Chapters
                </h3>

                <ul className=" space-y-2 sm:space-y-1">
                  {videoChapters.map((chapter, index) => (
                    <li
                      key={chapter.id || index}
                      className="flex items-center gap-2"
                    >
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => handleTimestampClick(chapter.startTime)}
                        className="text-primary text-md p-0 shrink-0 hover:underline disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed disabled:no-underline"
                        disabled={!hasVideo || state.isRateLimited}
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

interface EmptyStateProps extends React.ComponentProps<"div"> {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  variant?: "muted" | "destructive";
  posterUrl?: string;
  placeholder?: string;
}

function EmptyState({
  icon: Icon,
  title,
  description,
  variant = "muted",
  posterUrl,
  placeholder,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "relative w-full aspect-video rounded-xl overflow-hidden bg-background flex items-center justify-center mb-[6px]",
        className,
      )}
      {...props}
    >
      {posterUrl && (
        // biome-ignore lint/performance/noImgElement: data url placeholder
        <img
          src={placeholder}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover scale-110 opacity-50"
          aria-hidden="true"
        />
      )}
      {title && (
        <div className="absolute inset-0 bg-muted/60 dark:bg-card/60" />
      )}

      <div className="relative z-10 flex flex-col items-center gap-3 text-center max-w-md">
        {Icon && (
          <div
            className={cn(
              "p-4 rounded-full",
              variant === "destructive"
                ? "bg-destructive/10"
                : "bg-muted-foreground/10",
            )}
          >
            <Icon
              className={cn(
                "size-10",
                variant === "destructive"
                  ? "text-destructive"
                  : "text-muted-foreground",
              )}
            />
          </div>
        )}
        {title && (
          <h3
            className={cn(
              "text-lg font-bold",
              variant === "destructive" && "text-destructive",
            )}
          >
            {title}
          </h3>
        )}

        {description && (
          <p className="text-sm text-foreground/70">{description}</p>
        )}
      </div>
    </div>
  );
}
