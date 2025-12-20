import { revalidateTag } from "next/cache";
import type { CollectionAfterChangeHook } from "payload";

export const revalidateCourse: CollectionAfterChangeHook = async ({
  doc,
  req: { payload, context },
}) => {
  if (context.disableRevalidate) return doc;

  const tag = "courses-list";

  payload.logger.info(`Revalidating tag: ${tag} for course: ${doc.slug}`);
  revalidateTag(tag);

  return doc;
};
