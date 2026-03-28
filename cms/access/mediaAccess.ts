import type { Access } from "payload";
import {
  buildPublishedStatusWhere,
  canManageCourseContent,
} from "@/cms/access/contentAccess";
import { getServerSession } from "@/lib/auth/get-session";
import { hasEnrollment } from "@/lib/data/enrollment";

function getRequestedFilename(pathname?: string | null): string | null {
  if (!pathname?.includes("/file/")) return null;

  const filename = pathname.split("/").filter(Boolean).pop();

  return filename ? decodeURIComponent(filename) : null;
}

export const mediaReadAccess: Access = async ({ req }): Promise<boolean> => {
  try {
    if (canManageCourseContent(req.user)) return true;

    const filename = getRequestedFilename(req.pathname);
    if (!filename) return false;

    const media = await req.payload.find({
      collection: "media",
      depth: 0,
      limit: 1,
      overrideAccess: true,
      select: {
        filename: true,
      },
      where: {
        filename: {
          equals: filename,
        },
      },
    });

    if (!media.docs.length) return false;

    const lessons = await req.payload.find({
      collection: "lessons",
      depth: 0,
      limit: 10,
      overrideAccess: true,
      select: { uploadImage: true, free: true, course: true },
      where: {
        and: [
          buildPublishedStatusWhere(),
          { "uploadImage.filename": { equals: filename } },
        ],
      },
    });

    if (!lessons.docs.length) return false;
    if (lessons.docs.some((lesson) => lesson.free)) return true;

    const session = await getServerSession();
    if (!session?.user) return false;

    for (const lesson of lessons.docs) {
      const courseId =
        typeof lesson.course === "string" ? lesson.course : lesson.course?.id;

      if (!courseId) continue;
      if (await hasEnrollment(session.user.id, courseId)) return true;
    }

    return false;
  } catch (error) {
    console.error("Media access error:", error);
    return false;
  }
};
