import type { Access } from "payload";
import {
  buildPublishedStatusWhere,
  canManageCourseContent,
} from "@/cms/access/contentAccess";

// TODO: reverese relation to reduce query

function getRequestedFilename(pathname?: string | null): string | null {
  if (!pathname?.includes("/file/")) return null;

  const filename = pathname.split("/").filter(Boolean).pop();

  return filename ? decodeURIComponent(filename) : null;
}

export const posterReadAccess: Access = async ({ id, req }) => {
  if (canManageCourseContent(req.user)) return true;

  const filename = getRequestedFilename(req.pathname);
  const where = filename
    ? {
        and: [
          buildPublishedStatusWhere(),
          { "poster.filename": { equals: filename } },
        ],
      }
    : id
      ? {
          and: [buildPublishedStatusWhere(), { poster: { equals: id } }],
        }
      : null;

  if (!where) return false;

  const { docs } = await req.payload.find({
    collection: "courses",
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where,
  });

  return docs.length > 0;
};
