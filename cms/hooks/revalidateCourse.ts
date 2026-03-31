import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
} from "payload";
import type { Course } from "@/types/payload-types";
import { revalidateCourseCache } from "./revalidate";

export const revalidateCourse: CollectionAfterChangeHook<Course> = async ({
  doc,
  req: { payload, context },
}) => {
  if (context.disableRevalidate) return doc;
  if (doc.id && doc.slug)
    await revalidateCourseCache(payload, doc.id, doc.slug);
  return doc;
};

export const revalidateCourseAfterDelete: CollectionAfterDeleteHook<
  Course
> = async ({ doc, req: { payload, context } }) => {
  if (context.disableRevalidate) return doc;
  if (doc.id && doc.slug)
    await revalidateCourseCache(payload, doc.id, doc.slug);
  return doc;
};
