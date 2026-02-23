import { createBlurUp } from "@mux/blurup";
import type { Course, Lesson, MuxVideo } from "@/types/payload-types";
import { VideoPlayer } from "./video-player";

interface VideoLessonProps {
  lesson: Lesson;
}

export async function VideoLesson({ lesson }: VideoLessonProps) {
  const muxVideo = lesson.video as MuxVideo;
  const playbackOptions = muxVideo.playbackOptions ?? [];

  // 0 for signed, 1 for public
  const index = lesson.free ? 1 : 0;

  const {
    playbackId = null,
    playbackPolicy = "public",
    posterUrl = "",
  } = playbackOptions[index] ?? {};

  let blurDataURL: string | undefined;

  try {
    if (playbackOptions[1]?.playbackId) {
      // https://www.mux.com/docs/guides/player-customize-look-and-feel#provide-a-placeholder-while-the-poster-image-loads
      const result = await createBlurUp(playbackOptions[1].playbackId);
      blurDataURL = result.blurDataURL;
    }
  } catch (err) {
    console.warn("Failed to generate blur placeholder:", err);
    blurDataURL = undefined;
  }

  return (
    <VideoPlayer
      playbackId={playbackId}
      playbackPolicy={playbackPolicy}
      placeholder={blurDataURL}
      posterUrl={posterUrl}
      hasVideo={!!muxVideo?.playbackOptions?.length}
      videoId={muxVideo.id}
      videoTitle={muxVideo.title}
      videoChapters={lesson.videoChapters}
      // lesson info
      id={lesson.id}
      title={lesson.title}
      videoDescription={lesson.videoDescription}
      free={lesson.free}
      course={lesson.course as Course}
    />
  );
}
