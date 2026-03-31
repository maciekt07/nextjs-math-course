import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  PayloadRequest,
} from "payload";
import { buildPublishedStatusWhere } from "@/cms/access/contentAccess";
import { getId } from "@/cms/utils/get-id";

async function syncPosterVisibility(
  req: PayloadRequest,
  posterIds: (string | null)[],
) {
  const uniqueIds = [...new Set(posterIds.filter(Boolean))] as string[];
  if (!uniqueIds.length) return;

  const { payload } = req;

  const publishedCourses = await payload.find({
    req,
    collection: "courses",
    depth: 0,
    limit: 0,
    overrideAccess: true,
    select: { poster: true },
    where: {
      and: [buildPublishedStatusWhere(), { poster: { in: uniqueIds } }],
    },
  });

  const usedByPublished = new Set(
    publishedCourses.docs
      .map((c) => getId(c.poster))
      .filter((id): id is string => Boolean(id)),
  );

  await Promise.all(
    uniqueIds.map(async (posterId) => {
      const shouldBePublic = usedByPublished.has(posterId);

      const poster = await payload.findByID({
        req,
        collection: "posters",
        id: posterId,
        depth: 0,
        overrideAccess: true,
        select: { isPublic: true },
      });

      if (poster.isPublic === shouldBePublic) return;

      payload.logger.info(
        `Setting poster ${posterId} isPublic: ${shouldBePublic}`,
      );

      return payload.update({
        req,
        collection: "posters",
        id: posterId,
        overrideAccess: true,
        context: { disableRevalidate: true },
        data: { isPublic: shouldBePublic },
      });
    }),
  );
}

export const syncCoursePosterVisibilityAfterChange: CollectionAfterChangeHook =
  async ({ doc, previousDoc, req }) => {
    const posterIds = [getId(doc.poster), getId(previousDoc?.poster)];
    if (posterIds.every((id) => !id)) return doc;

    await syncPosterVisibility(req, posterIds);
    return doc;
  };

export const syncCoursePosterVisibilityAfterDelete: CollectionAfterDeleteHook =
  async ({ doc, req }) => {
    await syncPosterVisibility(req, [getId(doc.poster)]);
    return doc;
  };
