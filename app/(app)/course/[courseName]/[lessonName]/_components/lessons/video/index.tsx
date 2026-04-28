import type { Course, Lesson, MuxVideo } from "@/types/payload-types";
import { VideoPlayer } from "./video-player";

interface VideoLessonProps {
  lesson: Lesson;
}

export async function VideoLesson({ lesson }: VideoLessonProps) {
  const muxVideo = lesson.video as MuxVideo;

  const playbackOptions = muxVideo?.playbackOptions ?? [];

  const policy = lesson.free ? "public" : "signed";

  const selectedOption =
    playbackOptions.find((opt) => opt.playbackPolicy === policy) ??
    playbackOptions.find(Boolean);

  const {
    playbackId = null,
    playbackPolicy = "public",
    posterUrl = "",
  } = selectedOption ?? {};

  // https://www.mux.com/docs/guides/player-customize-look-and-feel#provide-a-placeholder-while-the-poster-image-loads
  const blurDataURL = lesson.videoBlurDataURL ?? undefined;

  return (
    <VideoPlayer
      playbackId={playbackId}
      playbackPolicy={playbackPolicy}
      placeholder={blurDataURL}
      posterUrl={posterUrl}
      hasVideo={!!playbackOptions.length}
      videoId={muxVideo?.id}
      videoTitle={muxVideo?.title}
      videoChapters={lesson.videoChapters}
      videoDurationSeconds={lesson.videoDurationSeconds}
      // lesson info
      id={lesson.id}
      title={lesson.title}
      videoDescription={lesson.videoDescription}
      free={lesson.free}
      course={lesson.course as Course}
    />
  );
}
