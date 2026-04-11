type LimitTree = {
  readonly [key: string]: number | LimitTree;
};

export const AUTH_LIMITS = {
  name: 32,
  email: 254,
  passwordMax: 72,
  passwordMin: 8,
  maxSessions: 2,
  /** 2 hours */
  verificationTokenTTL: 2 * 60 * 60,

  /** 15 minutes */
  resetPasswordTokenTTL: 15 * 60,

  /** 3 minutes */
  cookieCacheMaxAge: 60 * 3,

  /** 7 days */
  sessionExpiresIn: 60 * 60 * 24 * 7,
} as const satisfies LimitTree;

export const FEEDBACK_LIMITS = {
  comment: 200,
} as const satisfies LimitTree;

export const VIDEO_LIMITS = {
  playbackId: 100,
} as const satisfies LimitTree;

export const LESSON_LIMITS = {
  lessonId: 32,
} as const satisfies LimitTree;
