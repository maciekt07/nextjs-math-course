import { revalidateTag } from "next/cache";
import type { CollectionAfterChangeHook } from "payload";
import type { Lesson } from "@/types/payload-types";

export const revalidateLesson: CollectionAfterChangeHook<Lesson> = async ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (context.disableRevalidate) return doc;

  if (!doc.id) {
    payload.logger.warn("Missing lesson ID");
    return doc;
  }

  const tag = `lesson:${doc.id}`;

  if (doc._status === "draft" && previousDoc._status === "draft") {
    return doc;
  }

  payload.logger.info(`Revalidating tag: ${tag} for lesson ${doc.slug}`);
  revalidateTag(tag, "max");
  revalidateTag("courses-list", "max");
  return doc;
};
