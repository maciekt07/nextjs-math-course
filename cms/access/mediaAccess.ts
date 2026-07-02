import type { Access, Payload } from "payload";
import { buildPublishedStatusWhere } from "@/cms/access/contentAccess";
import { isAdminOrEditor } from "@/cms/access/roles";
import { getRequestedFilename } from "@/cms/utils/get-requested-filename";
import { getServerSession } from "@/lib/auth/get-session";
import { hasEnrollment } from "@/lib/data/enrollment";
import { redis } from "@/lib/redis";

const ACCESS_CACHE_TTL_SECONDS = 60 * 60;

function buildMediaCacheKey(filename: string, userId: string): string {
  return `media-access:${filename}:${userId}`;
}

export const mediaReadAccess: Access = async ({ req }): Promise<boolean> => {
  try {
    if (isAdminOrEditor(req.user)) return true;

    const filename = getRequestedFilename(req.pathname);
    if (!filename) return false;

    const session = await getServerSession();
    const userId = session?.user?.id;
    if (!userId) return false;

    const cacheKey = buildMediaCacheKey(filename, userId);

    try {
      const cached = await redis.get<boolean>(cacheKey);
      if (cached !== null && cached !== undefined) {
        return cached;
      }
    } catch (cacheError) {
      console.error("Media access cache read error:", cacheError);
    }

    const result = await resolveMediaAccess(req.payload, filename, userId);

    try {
      await redis.set(cacheKey, result, {
        ex: result ? ACCESS_CACHE_TTL_SECONDS : 2 * 60, // TODO:
      });
    } catch (cacheError) {
      console.error("Media access cache write error:", cacheError);
    }

    return result;
  } catch (error) {
    console.error("Media access error:", error);
    return false;
  }
};

async function resolveMediaAccess(
  payload: Payload,
  filename: string,
  userId: string,
): Promise<boolean> {
  const media = await payload.find({
    collection: "media-private",
    depth: 0,
    limit: 1,
    overrideAccess: true,
    select: { filename: true },
    where: { filename: { equals: filename } },
  });

  if (!media.docs.length) return false;

  const mediaId = media.docs[0].id;

  const lessons = await payload.find({
    collection: "lessons",
    depth: 0,
    limit: 10,
    overrideAccess: true,
    select: { uploadImage: true, free: true, course: true },
    where: {
      and: [
        buildPublishedStatusWhere(),
        { "uploadImage.relationTo": { equals: "media-private" } },
        { "uploadImage.value": { equals: mediaId } },
      ],
    },
  });

  if (!lessons.docs.length) return false;
  if (lessons.docs.some((lesson) => lesson.free)) return true;

  const courseIds = new Set<string>();
  for (const lesson of lessons.docs) {
    const courseId =
      typeof lesson.course === "string" ? lesson.course : lesson.course?.id;
    if (courseId) courseIds.add(courseId);
  }

  const enrollmentChecks = await Promise.all(
    [...courseIds].map((courseId) => hasEnrollment(userId, courseId)),
  );

  return enrollmentChecks.some(Boolean);
}
