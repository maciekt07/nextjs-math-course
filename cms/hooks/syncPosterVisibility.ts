import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  Payload,
} from "payload";
import { buildPublishedStatusWhere } from "@/cms/access/contentAccess";
import { getId } from "@/cms/utils/get-id";

async function syncPosterVisibility(
  payload: Payload,
  posterIds: (string | null)[],
) {
  const uniquePosterIds = [...new Set(posterIds.filter(Boolean))] as string[];

  if (!uniquePosterIds.length) return;

  const [posters, publishedCourses] = await Promise.all([
    payload.find({
      collection: "posters",
      depth: 0,
      limit: 0,
      overrideAccess: true,
      select: {
        isPublic: true,
      },
      where: {
        id: {
          in: uniquePosterIds,
        },
      },
    }),
    payload.find({
      collection: "courses",
      depth: 0,
      limit: 0,
      overrideAccess: true,
      select: {
        poster: true,
      },
      where: {
        and: [
          buildPublishedStatusWhere(),
          {
            poster: {
              in: uniquePosterIds,
            },
          },
        ],
      },
    }),
  ]);

  const publicPosterIds = new Set(
    publishedCourses.docs
      .map((course) => getId(course.poster))
      .filter((posterId): posterId is string => Boolean(posterId)),
  );

  await Promise.all(
    posters.docs.map((poster) => {
      const shouldBePublic = publicPosterIds.has(poster.id);

      if (poster.isPublic === shouldBePublic) return Promise.resolve();

      return payload.update({
        collection: "posters",
        id: poster.id,
        overrideAccess: true,
        data: {
          isPublic: shouldBePublic,
        },
      });
    }),
  );
}

export const syncCoursePosterVisibilityAfterChange: CollectionAfterChangeHook =
  async ({ doc, previousDoc, req }) => {
    await syncPosterVisibility(req.payload, [
      getId(doc.poster),
      getId(previousDoc?.poster),
    ]);

    return doc;
  };

export const syncCoursePosterVisibilityAfterDelete: CollectionAfterDeleteHook =
  async ({ doc, req }) => {
    await syncPosterVisibility(req.payload, [getId(doc.poster)]);

    return doc;
  };
