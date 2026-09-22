import type { Access, Payload } from "payload";
import { buildPublishedStatusWhere } from "@/cms/access/contentAccess";
import { isAdminOrEditor } from "@/cms/access/roles";
import { getId } from "@/cms/utils/get-id";
import { getRequestedFilename } from "@/cms/utils/get-requested-filename";
import { getServerSession } from "@/lib/auth/get-session";
import { LIMITS } from "@/lib/constants/limits";
import { getOwnedCourseIds } from "@/lib/data/enrollment";
import { redis } from "@/lib/redis";
import type { Lesson } from "@/types/payload-types";

type MediaAccessMetadata = {
  mediaId: string;
  courseIds: string[];
};

type MediaMetadataCacheValue = MediaAccessMetadata | { missing: true };

const METADATA_TTL = {
  found: LIMITS.media.signedDownloads,
  missing: 60,
} as const satisfies Record<"found" | "missing", number>;

const metadataCacheKey = (filename: string) =>
  `media-access:metadata:${filename}`;

async function readMetadataCache(
  filename: string,
): Promise<MediaMetadataCacheValue | null> {
  try {
    return await redis.get<MediaMetadataCacheValue>(metadataCacheKey(filename));
  } catch (error) {
    console.error("Media metadata cache read error:", error);
    return null;
  }
}

async function writeMetadataCache(
  filename: string,
  value: MediaMetadataCacheValue,
  ttl: number,
): Promise<void> {
  try {
    await redis.set(metadataCacheKey(filename), value, { ex: ttl });
  } catch (error) {
    console.error("Media metadata cache write error:", error);
  }
}

export const mediaReadAccess: Access = async ({ req }): Promise<boolean> => {
  try {
    if (isAdminOrEditor(req.user)) return true;

    const filename = getRequestedFilename(req.pathname);
    if (!filename) return false;

    const userId = (await getServerSession())?.user?.id;
    if (!userId) return false;

    const metadata = await getMediaAccessMetadata(req.payload, filename);
    if (!metadata) return false;

    const ownedCourseIds = new Set(await getOwnedCourseIds(userId));
    return metadata.courseIds.some((courseId) => ownedCourseIds.has(courseId));
  } catch (error) {
    console.error("Media access error:", error);
    return false;
  }
};

async function getMediaAccessMetadata(
  payload: Payload,
  filename: string,
): Promise<MediaAccessMetadata | null> {
  const cached = await readMetadataCache(filename);
  if (cached) return "missing" in cached ? null : cached;

  const metadata = await resolveMediaAccessMetadata(payload, filename);

  if (!metadata) {
    await writeMetadataCache(filename, { missing: true }, METADATA_TTL.missing);
    return null;
  }

  await writeMetadataCache(filename, metadata, METADATA_TTL.found);
  return metadata;
}

async function resolveMediaAccessMetadata(
  payload: Payload,
  filename: string,
): Promise<MediaAccessMetadata | null> {
  const media = await payload.find({
    collection: "media-private",
    depth: 0,
    limit: 1,
    overrideAccess: true,
    select: { filename: true },
    where: { filename: { equals: filename } },
  });

  const mediaId = media.docs[0]?.id;
  if (!mediaId) return null;

  const lessons = await payload.find({
    collection: "lessons",
    depth: 0,
    limit: 0,
    overrideAccess: true,
    select: { uploadImage: true, course: true },
    where: {
      and: [
        buildPublishedStatusWhere(),
        { "uploadImage.relationTo": { equals: "media-private" } },
        { "uploadImage.value": { equals: mediaId } },
      ],
    },
  });

  const courseIds = new Set<string>();
  for (const lesson of lessons.docs) {
    const courseId = getId(lesson.course);
    if (courseId) courseIds.add(courseId);
  }

  return { mediaId, courseIds: [...courseIds] };
}

export async function invalidateMediaAccessCache(
  filenames: Array<string | null | undefined>,
): Promise<void> {
  const keys = [
    ...new Set(filenames.filter(Boolean).map((f) => metadataCacheKey(f!))),
  ];
  if (!keys.length) return;

  try {
    await redis.del(...keys);
  } catch (error) {
    console.error("Media metadata cache invalidation error:", error);
  }
}

function getPrivateMediaReferences(lesson: Pick<Lesson, "uploadImage">) {
  return (lesson.uploadImage ?? [])
    .filter((image) => image.relationTo === "media-private")
    .map((image) => image.value);
}

export async function invalidateLessonMediaAccessCache(
  payload: Payload,
  lessons: Array<Pick<Lesson, "uploadImage"> | null | undefined>,
): Promise<void> {
  const references = lessons.flatMap((lesson) =>
    lesson ? getPrivateMediaReferences(lesson) : [],
  );

  const filenames = await Promise.all(
    references.map((reference) => resolveMediaFilename(payload, reference)),
  );

  await invalidateMediaAccessCache(filenames);
}

async function resolveMediaFilename(
  payload: Payload,
  reference: NonNullable<Lesson["uploadImage"]>[number]["value"],
): Promise<string | null | undefined> {
  if (typeof reference !== "string" && reference.filename) {
    return reference.filename;
  }

  const mediaId = getId(reference);
  if (!mediaId) return null;

  const media = await payload.findByID({
    collection: "media-private",
    id: mediaId,
    depth: 0,
    overrideAccess: true,
    select: { filename: true },
  });

  return media?.filename;
}
