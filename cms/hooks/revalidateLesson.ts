import { revalidateTag } from "next/cache";
import type { CollectionAfterChangeHook } from "payload";

export const revalidateLesson: CollectionAfterChangeHook = async ({
  doc,
  req: { payload, context },
}) => {
  if (context.disableRevalidate) return doc;

  if (!doc.id) {
    payload.logger.warn("Missing lesson ID");
    return doc;
  }

  const tag = `lesson:${doc.id}`;

  payload.logger.info(`Revalidating tag: ${tag} for lesson ${doc.slug}`);
  revalidateTag(tag);

  return doc;
};
