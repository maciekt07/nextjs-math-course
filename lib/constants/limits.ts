type LimitTree = {
  readonly [key: string]: number | LimitTree;
};

export const LIMITS = {
  auth: {
    nameMaxLength: 32,
    emailMaxLength: 254,
    passwordMaxLength: 72,
    passwordMinLength: 8,
    maxSessions: 2,

    /** 2 hours in seconds */
    verificationTokenTTL: 2 * 60 * 60,

    /** 15 minutes in seconds */
    resetPasswordTokenTTL: 15 * 60,

    /** 15 minutes in seconds */
    deleteTokenTTL: 15 * 60,

    /** 3 minutes in seconds */
    cookieCacheMaxAge: 60 * 3,

    /** 7 days in seconds */
    sessionExpiresIn: 60 * 60 * 24 * 7,
  },

  media: {
    /** 2 hours in seconds */
    signedDownloads: 60 * 60 * 2,
  },

  feedback: {
    commentMaxLength: 200,
  },

  video: {
    playbackIdMaxLength: 100,
  },

  lesson: {
    lessonIdMaxLength: 32,
  },
} as const satisfies LimitTree;
