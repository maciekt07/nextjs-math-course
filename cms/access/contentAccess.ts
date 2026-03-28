import type { Access, TypedUser, Where } from "payload";

export const isPayloadAdmin = (user: TypedUser | null): boolean =>
  user?.role === "admin";

export const canManageCourseContent = (user: TypedUser | null): boolean =>
  user?.role === "admin" || user?.role === "editor";

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
  if (canManageCourseContent(req.user)) return true;

  return publishedStatusWhere;
};

export const privilegedContentReadAccess: Access = ({ req }) =>
  canManageCourseContent(req.user);
