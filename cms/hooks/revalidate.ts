import { revalidateTag } from "next/cache";
import type { Payload } from "payload";

export async function revalidateCourseCache(
  payload: Payload,
  courseId: string,
  courseSlug?: string | null,
) {
  if (!courseSlug) {
    try {
      const course = await payload.findByID({
        collection: "courses",
        id: courseId,
        depth: 0,
        overrideAccess: true,
        select: { slug: true },
      });
      courseSlug = course?.slug;
    } catch {
      payload.logger.warn(`Could not look up slug for course ${courseId}`);
    }
  }

  payload.logger.info(
    `Revalidating cache for course: ${courseId} (slug: ${courseSlug ?? "unknown"})`,
  );

  revalidateTag(`course:${courseId}`, "max");
  if (courseSlug) revalidateTag(`course-slug:${courseSlug}`, "max");
  revalidateTag("courses-list", "max");
}

export function revalidateLessonCache(lessonId: string) {
  revalidateTag(`lesson:${lessonId}`, "max");
}
