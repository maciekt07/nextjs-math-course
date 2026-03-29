import type { Access, Where } from "payload";
import { isAdminOrEditor } from "@/cms/access/roles";

export function buildPublishedStatusWhere(pathPrefix?: string): Where {
  const statusPath = pathPrefix ? `${pathPrefix}._status` : "_status";

  return {
    [statusPath]: {
      equals: "published",
    },
  } as Where;
}

export const publishedStatusWhere = buildPublishedStatusWhere();

export const publicPublishedReadAccess: Access = ({ req }) => {
  if (isAdminOrEditor(req.user)) return true;

  return publishedStatusWhere;
};
