import "server-only";

import { choice, noul, TypeSafeClient } from "@typesafe-ai/sdk";
import { serverEnv } from "@/env/server";
import {
  feedbackClassification,
  toTypeSafeOptions,
} from "@/lib/constants/feedback-classification";

let cachedClient: TypeSafeClient | null = null;

export function getTypesafeClient() {
  const apiKey = serverEnv.TYPESAFE_API_KEY;
  if (!apiKey) return null;

  cachedClient ??= new TypeSafeClient({
    apiKey,
    logLevel: "off",
    timeout: 10_000,
    retry: {
      maxRetries: 2,
      backoffInitialMs: 500,
      backoffMaxMs: 5_000,
      respectRetryAfter: true,
    },
  });
  return cachedClient;
}

export const feedbackQuestions = {
  importance: choice(
    "How important is this feedback for improving the lesson or learner experience?",
    toTypeSafeOptions(feedbackClassification.importance),
  ),
  spam: noul(
    "Is this feedback spam, promotional content, abusive noise, or unrelated to the lesson, course or platform?",
    {
      true: "The feedback is spam, promotional, abusive noise, or unrelated.",
      false:
        "The feedback is genuine and related to the lesson or learner experience.",
    },
  ),
  category: choice("What is the primary category of this feedback?", {
    ...toTypeSafeOptions(feedbackClassification.category),
  }),
  sentiment: choice("What is the overall sentiment of this feedback?", {
    ...toTypeSafeOptions(feedbackClassification.sentiment),
  }),
  actionable: noul(
    "Does this feedback require a concrete follow-up from the course team?",
    {
      true: "There is a specific issue, request, or question that merits follow-up.",
      false: "No concrete follow-up is needed.",
    },
  ),
} as const;
