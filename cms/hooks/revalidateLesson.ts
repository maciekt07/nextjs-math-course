import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
} from "payload";
import { getId } from "@/cms/utils/get-id";
import type { Lesson } from "@/types/payload-types";
import { revalidateCourseCache } from "./revalidate";

export const revalidateLesson: CollectionAfterChangeHook<Lesson> = async ({
  doc,
  req: { payload, context },
}) => {
  if (context.disableRevalidate) return doc;
  const courseId = getId(doc.course);
  if (courseId) await revalidateCourseCache(payload, courseId);
  return doc;
};

export const revalidateLessonAfterDelete: CollectionAfterDeleteHook<
  Lesson
> = async ({ doc, req: { payload, context } }) => {
  if (context.disableRevalidate) return doc;
  const courseId = getId(doc.course);
  if (courseId) await revalidateCourseCache(payload, courseId);
  return doc;
};
