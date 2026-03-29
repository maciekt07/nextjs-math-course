import { revalidateTag } from "next/cache";
import type { CollectionAfterChangeHook } from "payload";
import type { Course } from "@/types/payload-types";

export const revalidateCourse: CollectionAfterChangeHook<Course> = async ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (context.disableRevalidate) return doc;

  const tag = "courses-list";

  if (doc._status === "draft" && previousDoc._status === "draft") {
    return doc;
  }

  payload.logger.info(`Revalidating tag: ${tag} for course: ${doc.slug}`);
  revalidateTag(tag, "max");

  return doc;
};
