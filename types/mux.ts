export type ChapterThumbnailToken = {
  startTime: number;
  token: string;
};

export type MuxTokens = {
  playback: string;
  thumbnail: string;
  storyboard: string;
  chapterThumbnails?: ChapterThumbnailToken[];
};
