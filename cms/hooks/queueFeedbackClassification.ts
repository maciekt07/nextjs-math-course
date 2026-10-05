import type { CollectionAfterChangeHook } from "payload";
import { classificationQueue } from "@/lib/constants/queues";

export const queueFeedbackClassification: CollectionAfterChangeHook = async ({
  doc,
  operation,
  req,
}) => {
  if (operation !== "create") return doc;
  if (!doc.comment?.trim()) return doc;

  try {
    await req.payload.jobs.queue({
      task: "classify-feedback",
      input: { feedbackId: doc.id },
      queue: classificationQueue,
    });
  } catch (error) {
    req.payload.logger.error({
      err: error,
      msg: `Failed to queue feedback classification for ${doc.id}`,
    });
  }

  return doc;
};
