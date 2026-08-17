"use server";

import { Ratelimit } from "@upstash/ratelimit";
import sanitizeHtml from "sanitize-html";
import { getServerSession } from "@/lib/auth/get-session";
import { LIMITS } from "@/lib/constants/limits";
import { reactionValues } from "@/lib/constants/reactions";
import { getPayloadClient } from "@/lib/payload-client";
import { redis } from "@/lib/redis";

const limiter = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(2, "180 s"),
  analytics: true,
  prefix: "feedback_ratelimit",
});

const sanitize = (text: string) =>
  sanitizeHtml(text, {
    allowedTags: [],
    allowedAttributes: {},
  });

export type SubmitFeedbackResult =
  | { success: true }
  | { success: false; error: string };

export async function submitFeedbackAction(input: {
  lessonId: string;
  reaction: number;
  comment?: string;
}): Promise<SubmitFeedbackResult> {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }
    if (!session.user.emailVerified) {
      return { success: false, error: "Email not verified" };
    }
    const { name: userName, id: userId, email: userEmail } = session.user;

    const { success } = await limiter.limit(userId);
    if (!success) {
      return {
        success: false,
        error: "Too many requests, try again later",
      };
    }

    const { lessonId, reaction, comment = "" } = input;

    if (
      !lessonId ||
      typeof lessonId !== "string" ||
      !lessonId.trim() ||
      lessonId.trim().length > LIMITS.lesson.lessonIdMaxLength
    ) {
      return { success: false, error: "Invalid lessonId" };
    }

    if (!(reactionValues as number[]).includes(reaction)) {
      return {
        success: false,
        error: `Reaction must be one of: ${reactionValues.join(", ")}`,
      };
    }

    if (comment && typeof comment !== "string") {
      return { success: false, error: "Invalid comment" };
    }

    const trimmedComment = comment.trim();
    if (trimmedComment.length > LIMITS.feedback.commentMaxLength) {
      return {
        success: false,
        error: `Comment is too long (${trimmedComment.length}/${LIMITS.feedback.commentMaxLength})`,
      };
    }

    const sanitizedComment = sanitize(trimmedComment);
    if (trimmedComment && !sanitizedComment) {
      return {
        success: false,
        error: "Comment contains invalid or disallowed content",
      };
    }

    const payload = await getPayloadClient();

    await payload.create({
      collection: "feedback",
      data: {
        lesson: lessonId,
        userName,
        userEmail,
        userId,
        reaction,
        comment: sanitizedComment,
      },
      overrideAccess: true,
    });

    return { success: true };
  } catch (error) {
    console.error("Error creating feedback:", error);
    return { success: false, error: "Failed to submit feedback" };
  }
}
