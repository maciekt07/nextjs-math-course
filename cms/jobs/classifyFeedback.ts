import { APIError, type TypeSafeClient } from "@typesafe-ai/sdk";
import { JobCancelledError, NotFound, type TaskConfig } from "payload";
import { feedbackQuestions, getTypesafeClient } from "@/lib/typesafe";
import type { Feedback } from "@/types/payload-types";

type FeedbackClassificationTask = {
  input: { feedbackId: string };
  output: { feedbackId: string; status: "classified" | "skipped" };
};

const MAX_ATTEMPTS = 3;

function getLessonTitle(lesson: Feedback["lesson"]) {
  if (!lesson || typeof lesson === "string") return undefined;
  return typeof lesson === "object" && "title" in lesson
    ? (lesson.title ?? undefined)
    : undefined;
}

function formatError(error: unknown) {
  if (error instanceof Error) return error.message.slice(0, 1_000);
  return String(error).slice(0, 1_000);
}

function isPermanentTypeSafeError(error: unknown) {
  return (
    error instanceof APIError &&
    [400, 401, 403, 404, 422].includes(error.status)
  );
}

export const classifyFeedbackTask: TaskConfig<FeedbackClassificationTask> = {
  slug: "classify-feedback",
  label: "Classify lesson feedback",
  retries: {
    attempts: MAX_ATTEMPTS,
    backoff: { type: "exponential", delay: 30_000 },
  },
  concurrency: ({ input }) => `feedback:${input.feedbackId}`,
  inputSchema: [{ name: "feedbackId", type: "text", required: true }],
  outputSchema: [
    { name: "feedbackId", type: "text", required: true },
    { name: "status", type: "text", required: true },
  ],
  handler: async ({ input, req }) => {
    let feedback: Feedback;
    try {
      feedback = (await req.payload.findByID({
        collection: "feedback",
        id: input.feedbackId,
        depth: 1,
        overrideAccess: true,
      })) as Feedback;
    } catch (error) {
      if (error instanceof NotFound) {
        throw new JobCancelledError(
          `Feedback ${input.feedbackId} no longer exists`,
        );
      }
      throw error;
    }

    if (!feedback.comment?.trim()) {
      await req.payload.update({
        collection: "feedback",
        id: input.feedbackId,
        data: { classificationStatus: "skipped" },
        overrideAccess: true,
      });
      return { output: { feedbackId: input.feedbackId, status: "skipped" } };
    }

    await req.payload.update({
      collection: "feedback",
      id: input.feedbackId,
      data: { classificationStatus: "processing", classificationError: null },
      overrideAccess: true,
    });

    try {
      const client = getTypesafeClient();
      if (!client) {
        await req.payload.update({
          collection: "feedback",
          id: input.feedbackId,
          data: {
            classificationStatus: "failed",
            classificationError: "TYPESAFE_API_KEY is not configured",
          },
          overrideAccess: true,
        });
        throw new JobCancelledError("TYPESAFE_API_KEY is not configured");
      }

      const response = await classifyFeedback(client, feedback);
      const { answers } = response;

      await req.payload.update({
        collection: "feedback",
        id: input.feedbackId,
        data: {
          classificationStatus: "classified",
          importance: answers.importance.choice,
          spam: answers.spam.noul >= 0.5,
          category: answers.category.choice,
          sentiment: answers.sentiment.choice,
          classificationConfidence: Math.min(
            answers.importance.confidence,
            answers.category.confidence,
            answers.sentiment.confidence,
          ),
          spamProbability: answers.spam.noul,
          actionableProbability: answers.actionable.noul,
          classificationProbabilities: {
            importance: answers.importance.probabilities,
            spam: { true: answers.spam.noul, false: 1 - answers.spam.noul },
            category: answers.category.probabilities,
            sentiment: answers.sentiment.probabilities,
            actionable: {
              true: answers.actionable.noul,
              false: 1 - answers.actionable.noul,
            },
          },
          classificationModel: response.model,
          classifiedAt: new Date().toISOString(),
          classificationError: null,
        },
        overrideAccess: true,
      });

      return { output: { feedbackId: input.feedbackId, status: "classified" } };
    } catch (error) {
      if (isPermanentTypeSafeError(error)) {
        throw new JobCancelledError(
          `Feedback classification cannot be retried: ${formatError(error)}`,
        );
      }

      throw error;
    }
  },
  onFail: async ({ input, job, req }) => {
    const taskInput = input as { feedbackId?: string } | undefined;
    if (!taskInput?.feedbackId) return;

    await req.payload.update({
      collection: "feedback",
      id: taskInput.feedbackId,
      data: {
        classificationStatus: "failed",
        classificationError: formatError(
          job.error ?? "Unknown classification error",
        ),
      },
      overrideAccess: true,
    });
  },
};

async function classifyFeedback(client: TypeSafeClient, feedback: Feedback) {
  return client.systemOne({
    state: {
      lessonTitle: getLessonTitle(feedback.lesson) ?? null,
      reaction: feedback.reaction,
      comment: feedback.comment ?? "",
    },
    questions: feedbackQuestions,
  });
}
