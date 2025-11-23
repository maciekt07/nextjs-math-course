"use client";

import MuxPlayer, { type MuxPlayerRefAttributes } from "@mux/mux-player-react";
import { Video } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchMuxToken } from "@/lib/mux-token-cache";
import type { Lesson, MuxVideo } from "@/payload-types";
import { formatDuration } from "@/utils/format";

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

  const muxPlayerCallback = useCallback(
    (node: MuxPlayerRefAttributes | null) => {
      playerElementRef.current = node;
      if (!node || !lesson.chapters || lesson.chapters.length === 0) return;

      // https://www.mux.com/docs/guides/player-advanced-usage#chapters-example
      const addChaptersToPlayer = () => {
        if (!lesson.chapters) return;

        const chapters = lesson.chapters.map((chapter) => ({
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
    [lesson.chapters],
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
            src: muxVideo.playbackOptions?.[0]?.posterUrl || "",
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
      .then((t) => mounted && setToken(t))
      .catch((err) => console.error("Error fetching mux token:", err));

    return () => {
      mounted = false;
    };
  }, [muxVideo, lesson.free]);

  const handleTimestampClick = (startTime: number) => {
    const player = playerElementRef.current;
    if (player && "currentTime" in player) {
      player.currentTime = startTime;
      player.play();
      player.scrollIntoView({
        //FIXME: chapter scroll to top of area
        behavior: "smooth",
        block: "start",
      });
    }
  };

  if (!muxVideo || !muxVideo.playbackOptions?.length) {
    return (
      <div className="flex justify-center items-center min-h-[200px] px-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-8 flex justify-center">
            <p className="text-muted-foreground text-center">
              No video available.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const playback = muxVideo.playbackOptions[0];
  const playbackId = playback.playbackId || "";
  const poster = playback.posterUrl || undefined;

  const tokenToUse = token;

  const shouldUseSigned = playback.playbackPolicy === "signed";
  const src = shouldUseSigned
    ? undefined
    : playbackId
      ? `https://stream.mux.com/${playbackId}.m3u8`
      : undefined;

  // skeleton for token loading
  if (shouldUseSigned && !tokenToUse) {
    return (
      <div className="flex flex-col gap-4 animate-pulse" ref={playerRef}>
        <Skeleton className="h-12 w-3/4 rounded-lg" />
        <div className="w-full aspect-video rounded-xl overflow-hidden bg-muted">
          <Skeleton className="h-full w-full" />
        </div>
        <Card>
          <CardHeader className="border-b">
            <CardTitle>
              <Skeleton className="h-6 w-1/3 rounded-lg" />
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Skeleton className="h-4 w-full rounded-lg" />
            <Skeleton className="h-4 w-full rounded-lg" />
            <Skeleton className="h-4 w-5/6 rounded-lg" />
            <Skeleton className="h-4 w-4/5 rounded-lg" />
            <Skeleton className="h-4 w-11/12 rounded-lg" />
            <Skeleton className="h-4 w-3/4 rounded-lg" />
            <Skeleton className="h-4 w-5/6 rounded-lg" />
            <Skeleton className="h-4 w-full rounded-lg" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4" ref={playerRef}>
      <MuxPlayer
        ref={muxPlayerCallback}
        playbackId={playbackId || undefined}
        src={src}
        tokens={shouldUseSigned ? { playback: tokenToUse } : undefined}
        poster={poster}
        title={muxVideo.title}
        accentColor="#4E65FF"
        proudlyDisplayMuxBadge
        metadata={{
          video_title: muxVideo.title,
          video_id: muxVideo.id,
          lesson_id: lesson.id,
        }}
        streamType="on-demand"
        autoPlay={false}
        style={{
          width: "100%",
          aspectRatio: 16 / 9,
          borderRadius: "1rem",
          overflow: "hidden",
        }}
      />

      <Card className="-mb-2 mt-2">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2 -mb-2">
            <Video className="w-5 h-5 text-primary" />
            Video Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MarkdownRenderer
            content={lesson.videoDescription || "No Description"}
            unoptimized={!lesson.free}
          />
          {lesson.chapters && lesson.chapters.length > 0 && (
            <>
              <Separator className="mt-4" />
              <div className="mt-4">
                <h3 className="text-xl font-semibold mb-4 text-primary">
                  Chapters
                </h3>
                <ul className="space-y-2">
                  {lesson.chapters.map((chapter, index) => (
                    <li
                      key={chapter.id || index}
                      className="flex items-center gap-3"
                    >
                      <button
                        type="button"
                        onClick={() => handleTimestampClick(chapter.startTime)}
                        className="text-primary font-medium shrink-0 hover:underline cursor-pointer"
                      >
                        {formatDuration(chapter.startTime)}
                      </button>
                      <span className="truncate">{chapter.title}</span>
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
