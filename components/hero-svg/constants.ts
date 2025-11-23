export type HeroAnimationKey =
  | "gradCapBooks"
  | "pen"
  | "laptopBooks"
  | "pencil"
  | "laptop"
  | "videoBar"
  | "characterDetails"
  | "characterGlasses"
  | "characterEyebrows"
  | "characterRightEye"
  | "speechBubble"
  | "graduationCap";

export type HeroAnimationConfig = {
  [key in HeroAnimationKey]: { delay: number };
};

export const heroAnimation: HeroAnimationConfig = {
  gradCapBooks: { delay: 0 },
  pen: { delay: 0.2 },
  laptopBooks: { delay: 0.35 },
  pencil: { delay: 0.5 },
  laptop: { delay: 0.65 },
  videoBar: { delay: 0.9 },
  characterDetails: { delay: 1.2 },
  characterGlasses: { delay: 1.3 },
  characterEyebrows: { delay: 1.5 },
  characterRightEye: { delay: 1.5 },
  speechBubble: { delay: 1.7 },
  graduationCap: { delay: 2 },
};
