import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
} from "payload";
import { getId } from "@/cms/utils/get-id";
import type { Chapter } from "@/types/payload-types";
import { revalidateCourseCache } from "./revalidate";

export const revalidateChapter: CollectionAfterChangeHook<Chapter> = async ({
  doc,
  req: { payload, context },
}) => {
  if (context.disableRevalidate) return doc;
  const courseId = getId(doc.course);
  if (courseId) await revalidateCourseCache(payload, courseId);
  return doc;
};

export const revalidateChapterAfterDelete: CollectionAfterDeleteHook<
  Chapter
> = async ({ doc, req: { payload, context } }) => {
  if (context.disableRevalidate) return doc;
  const courseId = getId(doc.course);
  if (courseId) await revalidateCourseCache(payload, courseId);
  return doc;
};
