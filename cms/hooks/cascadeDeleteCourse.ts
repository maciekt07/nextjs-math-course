import type { CollectionAfterDeleteHook } from "payload";
import type { Course } from "@/types/payload-types";

export const cascadeDeleteCourse: CollectionAfterDeleteHook<Course> = async ({
  req,
  doc,
}) => {
  const { payload } = req;
  if (!doc?.id) return doc;

  const courseId = doc.id;

  try {
    payload.logger.info(
      `Cascade deleting chapters and lessons for course: ${courseId}`,
    );

    const chaptersResult = await payload.delete({
      req,
      collection: "chapters",
      where: { course: { equals: courseId } },
      overrideAccess: true,
    });

    const lessonsResult = await payload.delete({
      req,
      collection: "lessons",
      where: { course: { equals: courseId } },
      overrideAccess: true,
    });

    payload.logger.info(
      `Successfully deleted ${chaptersResult.docs.length} chapters and ${lessonsResult.docs.length} lessons for course ${courseId}`,
    );
  } catch (error) {
    payload.logger.error(
      `Failed to cascade delete course dependencies: ${error}`,
    );
  }

  return doc;
};
