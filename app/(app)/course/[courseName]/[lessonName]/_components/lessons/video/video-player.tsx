"use client";
import MuxPlayer, { type MuxPlayerRefAttributes } from "@mux/mux-player-react";
import {
  AlertCircle,
  Loader2Icon,
  type LucideIcon,
  Video,
  VideoOff,
} from "lucide-react";
import dynamic from "next/dynamic";
import type React from "react";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { toast } from "sonner";
import { useWebHaptics } from "web-haptics/react";
import { MarkdownRenderer } from "@/components/markdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useMounted } from "@/hooks/use-mounted";
import { fetchMuxToken, RateLimitError } from "@/lib/mux-token-cache";
import { cn } from "@/lib/ui";
import type { MuxTokens } from "@/types/mux";
import type { Course, Lesson, MuxVideo } from "@/types/payload-types";
import { VideoChaptersSkeleton } from "./video-chapters";

const VideoChapters = dynamic(
  () =>
    import("./video-chapters").then((mod) => ({
      default: mod.VideoChapters,
    })),
  {
    loading: VideoChaptersSkeleton,
  },
);

type PlaybackOption = NonNullable<MuxVideo["playbackOptions"]>[number];

interface VideoPlayerProps
  extends Pick<
    Lesson,
    | "videoChapters"
    | "free"
    | "videoDescription"
    | "id"
    | "title"
    | "videoDurationSeconds"
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
  videoDurationSeconds,
  free,
  course,
}: VideoPlayerProps) {
  const mounted = useMounted();
  const { trigger } = useWebHaptics();
  const playerRef = useRef<HTMLDivElement>(null);
  const playerElementRef = useRef<MuxPlayerRefAttributes | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);

  type MuxState = {
    tokens: Partial<MuxTokens>;
    isRateLimited: boolean;
    error: string | null;
  };

  type Action =
    | { type: "SET_TOKENS"; tokens: Partial<MuxTokens> }
    | { type: "SET_RATE_LIMITED"; value: boolean }
    | { type: "SET_ERROR"; error: string };

  function reducer(state: MuxState, action: Action): MuxState {
    switch (action.type) {
      case "SET_TOKENS":
        return {
          ...state,
          tokens: action.tokens,
          isRateLimited: false,
          error: null,
        };
      case "SET_RATE_LIMITED":
        return { ...state, isRateLimited: action.value, error: null };
      case "SET_ERROR":
        return { ...state, isRateLimited: false, error: action.error };
      default:
        return state;
    }
  }

  const [state, dispatch] = useReducer(reducer, {
    tokens: {},
    isRateLimited: false,
    error: null,
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
            tokens: {
              playback: t.playback,
              thumbnail: t.thumbnail,
              storyboard: t.storyboard,
              chapterThumbnails: t.chapterThumbnails,
            },
          });
        }
      })
      .catch((err) => {
        if (!mounted) return;
        if (err instanceof RateLimitError) {
          dispatch({ type: "SET_RATE_LIMITED", value: true });
          toast.error("Rate limit exceeded. Please try again later.");
        } else {
          dispatch({ type: "SET_ERROR", error: err.message });
          toast.error(`Failed to fetch video token: ${err.message}`);
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
      trigger();
      setCurrentTime(startTime);
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

    if (state.error) {
      return (
        <EmptyState
          icon={AlertCircle}
          title="Video Error"
          description={state.error}
          variant="destructive"
        />
      );
    }

    if (!state.tokens.playback && playbackPolicy === "signed") {
      return (
        <div className="w-full aspect-video rounded-xl overflow-hidden flex items-center justify-center bg-background mb-1.5">
          <Loader2Icon className="animate-spin size-[90px] text-foreground/10" />
        </div>
      );
    }

    // const playerMotionProps: HTMLMotionProps<"div"> = {
    //   initial: {
    //     opacity: 0.6,
    //     ...(prefersReducedMotion ? {} : { scale: 0.94 }),
    //   },
    //   animate: {
    //     opacity: 1,
    //     ...(prefersReducedMotion ? {} : { scale: 1 }),
    //   },
    //   transition: { duration: 0.2 },
    // };

    return (
      <div>
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
          onTimeUpdate={() => {
            const player = playerElementRef.current;
            if (player && "currentTime" in player) {
              setCurrentTime(player.currentTime);
            }
          }}
          onError={(e) => console.log(e)}
          preload="metadata"
          streamType="on-demand"
          autoPlay={false}
          className="rounded-xl w-full overflow-hidden bg-background aspect-video shadow-xl"
        />
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4" ref={playerRef}>
      {mounted ? renderVideoArea() : <EmptyState className="bg-transparent" />}
      <Card className="mt-6 bg-card/40 shadow-none">
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
              <Separator className="mb-4 mt-6" />
              <VideoChapters
                playbackId={playbackId}
                chapterThumbnailTokens={
                  playbackPolicy === "signed"
                    ? state.tokens.chapterThumbnails
                    : undefined
                }
                currentTime={currentTime}
                hasVideo={hasVideo}
                isRateLimited={state.isRateLimited}
                onChapterSelect={handleTimestampClick}
                placeholder={placeholder}
                videoChapters={videoChapters}
                videoDuration={videoDurationSeconds}
                tokensReady={
                  playbackPolicy !== "signed" || !!state.tokens.thumbnail
                }
              />
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
