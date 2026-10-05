import "server-only";

import { choice, noul, TypeSafeClient } from "@typesafe-ai/sdk";
import { serverEnv } from "@/env/server";

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
    {
      low: "Minor preference, compliment, or issue with little impact on learning.",
      normal:
        "Useful feedback that should be considered during normal course maintenance.",
      high: "A meaningful issue affecting understanding, correctness, or a substantial number of learners.",
      urgent:
        "A severe correctness, access, safety, or learner-blocking issue requiring prompt attention.",
    },
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
    bug: "Reports an error, broken behavior, incorrect result, or technical defect.",
    content:
      "Comments on the explanation, examples, difficulty, correctness, or missing content.",
    question: "Asks for clarification or expresses a learner question.",
    usability:
      "Concerns navigation, presentation, accessibility, or ease of use.",
    praise:
      "Primarily positive appreciation without a concrete issue or request.",
    other: "Does not fit the other categories.",
  }),
  sentiment: choice("What is the overall sentiment of this feedback?", {
    positive: "Mostly appreciative or satisfied.",
    neutral: "Factual or balanced without a clear positive or negative tone.",
    negative: "Mostly dissatisfied, frustrated, or critical.",
    mixed: "Contains substantial positive and negative sentiment.",
  }),
  actionable: noul(
    "Does this feedback require a concrete follow-up from the course team?",
    {
      true: "There is a specific issue, request, or question that merits follow-up.",
      false: "No concrete follow-up is needed.",
    },
  ),
} as const;
