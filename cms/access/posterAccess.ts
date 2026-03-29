import type { Access, Where } from "payload";
import { isAdminOrEditor } from "@/cms/access/roles";
import { getRequestedFilename } from "@/cms/utils/get-requested-filename";

export const posterReadAccess: Access = ({ id, req }) => {
  if (isAdminOrEditor(req.user)) return true;

  const filename = getRequestedFilename(req.pathname);
  const and: Where[] = [
    {
      isPublic: {
        equals: true,
      },
    },
  ];

  if (filename) {
    and.push({
      filename: {
        equals: filename,
      },
    });
  }

  if (id) {
    and.push({
      id: {
        equals: id,
      },
    });
  }

  return {
    and,
  };
};
