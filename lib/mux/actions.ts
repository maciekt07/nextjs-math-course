"use server";

import { Ratelimit } from "@upstash/ratelimit";
import { and, eq } from "drizzle-orm";
import { publishedStatusWhere } from "@/cms/access/contentAccess";
import { db } from "@/drizzle/db";
import { enrollment } from "@/drizzle/schema";
import { clientEnv } from "@/env/client";
import { serverEnv } from "@/env/server";
import { getServerSession } from "@/lib/auth/get-session";
import { LIMITS } from "@/lib/constants/limits";
import { mux } from "@/lib/mux/mux";
import { getPayloadClient } from "@/lib/payload-client";
import { redis } from "@/lib/redis";
import type { MuxTokens } from "@/types/mux";

const limiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(6, "180 s"),
  analytics: true,
  prefix: "mux_token_ratelimit",
});

export type MuxTokenActionResult =
  | { success: true; tokens: MuxTokens }
  | { success: false; error: string; status: number };

export async function getMuxTokenAction(
  playbackId: string,
): Promise<MuxTokenActionResult> {
  try {
    const session = await getServerSession({
      query: { disableCookieCache: true },
    });
    if (!session?.user) {
      return { success: false, error: "Unauthorized", status: 401 };
    }
    if (!session.user.emailVerified) {
      return { success: false, error: "Email not verified", status: 403 };
    }

    if (
      !playbackId ||
      typeof playbackId !== "string" ||
      playbackId.length > LIMITS.video.playbackIdMaxLength
    ) {
      return { success: false, error: "Invalid playbackId", status: 400 };
    }

    if (!serverEnv.MUX_JWT_KEY || !serverEnv.MUX_JWT_KEY_ID) {
      return {
        success: false,
        error: "Server missing MUX_JWT_KEY or MUX_JWT_KEY_ID",
        status: 500,
      };
    }

    const userId = session.user.id;

    const { success } = await limiter.limit(userId);
    if (!success) {
      return {
        success: false,
        error: "Too many requests, try again later",
        status: 429,
      };
    }

    const payload = await getPayloadClient();
    const found = await payload.find({
      collection: "mux-video",
      overrideAccess: true,
      where: { "playbackOptions.playbackId": { equals: playbackId } },
      limit: 1,
    });

    const video = found.docs?.[0];
    if (!video) {
      return { success: false, error: "Video not found", status: 404 };
    }

    const lessons = await payload.find({
      collection: "lessons",
      overrideAccess: true,
      where: {
        and: [publishedStatusWhere, { video: { equals: video.id } }],
      },
      limit: 1,
      select: { course: true, videoChapters: true },
    });

    const lesson = lessons.docs?.[0];
    if (!lesson) {
      return {
        success: false,
        error: "No lesson references this video",
        status: 404,
      };
    }

    const courseId =
      typeof lesson.course === "string" ? lesson.course : lesson.course?.id;
    if (!courseId) {
      return { success: false, error: "Lesson course missing", status: 400 };
    }

    const rows = await db
      .select()
      .from(enrollment)
      .where(
        and(
          eq(enrollment.userId, userId),
          eq(enrollment.courseId, courseId),
          eq(enrollment.status, "completed"),
        ),
      )
      .limit(1);

    if (!rows.length) {
      return { success: false, error: "Forbidden", status: 403 };
    }

    const expiration = clientEnv.NEXT_PUBLIC_MUX_SIGNED_URL_EXPIRATION;

    const chapterStartTimes = (lesson.videoChapters || [])
      .sort((a, b) => a.startTime - b.startTime)
      .map((chapter) => chapter.startTime);

    const chapterThumbnails = await Promise.all(
      chapterStartTimes.map(async (startTime) => {
        const token = await mux.jwt.signPlaybackId(playbackId, {
          expiration,
          type: "thumbnail",
          params: { time: startTime.toString() },
        });
        return { startTime, token };
      }),
    );

    const [videoToken, thumbnailToken, storyboardToken] = await Promise.all([
      mux.jwt.signPlaybackId(playbackId, { expiration, type: "video" }),
      mux.jwt.signPlaybackId(playbackId, {
        expiration,
        type: "thumbnail",
      }),
      mux.jwt.signPlaybackId(playbackId, { expiration, type: "storyboard" }),
    ]);

    return {
      success: true,
      tokens: {
        playback: videoToken,
        thumbnail: thumbnailToken,
        storyboard: storyboardToken,
        chapterThumbnails,
      },
    };
  } catch (err) {
    console.error("getMuxTokenAction error:", err);
    return { success: false, error: "Internal server error", status: 500 };
  }
}
