import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import type { Access } from "payload";
import { db } from "@/drizzle/db";
import { enrollment } from "@/drizzle/schema";
import { auth } from "@/lib/auth";
export const mediaReadAccess: Access = async ({ req }) => {
  try {
    const url = req.pathname;
    const id = url.match(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
    )?.[0];

    if (req.user?.role === "admin" || req.user?.role === "editor") {
      return true;
    }

    if (!id) return false;

    const allCourses = await req.payload.find({
      collection: "courses",
      where: {
        and: [
          {
            media: { exists: true },
          },
        ],
      },
      depth: 1,
      select: { media: true },
    });

    // check if media is a course thumbnail
    const courseWithMedia = allCourses.docs.filter((course) => {
      if (!course.media) return false;
      const mediaURL =
        typeof course.media === "string" ? course.media : course.media.url;

      return mediaURL === url;
    });

    // course thumbnails are always public
    if (courseWithMedia.length > 0) {
      return true;
    }

    // check if media is in the uploadImage array
    const allLessons = await req.payload.find({
      collection: "lessons",
      where: {
        and: [
          {
            uploadImage: { exists: true },
          },
        ],
      },
      depth: 1,
      select: { uploadImage: true, free: true, course: true },
    });

    const lessonsWithMedia = allLessons.docs.filter((lesson) => {
      if (!lesson.uploadImage || !Array.isArray(lesson.uploadImage))
        return false;

      return lesson.uploadImage.some((mediaItem) => {
        const mediaURL =
          typeof mediaItem === "string" ? mediaItem : mediaItem.url;
        return mediaURL === url;
      });
    });

    if (lessonsWithMedia.length === 0) {
      return false;
    }

    const lesson = lessonsWithMedia[0];

    // free lesson images are public
    if (lesson.free) {
      return true;
    }

    // for paid lessons user must be authenticated
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return false;
    }

    const courseId =
      typeof lesson.course === "string" ? lesson.course : lesson.course?.id;

    if (!courseId) {
      return false;
    }

    // check enrollment
    const userEnrollments = await db
      .select()
      .from(enrollment)
      .where(
        and(
          eq(enrollment.userId, session.user.id),
          eq(enrollment.courseId, courseId),
          eq(enrollment.status, "completed"),
        ),
      )
      .limit(1);

    const hasAccess = userEnrollments.length > 0;

    return hasAccess;
  } catch (error) {
    console.error("Media access error:", error);
    return false;
  }
};
