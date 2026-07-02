import type { Access, CollectionConfig } from "payload";
import { isAdminOrEditor } from "@/cms/access/roles";
import { generateBlurhash } from "@/cms/hooks/generateBlurhash";
import { mediaReadAccess } from "../access/mediaAccess";
import { renameFile } from "../hooks/renameFile";

const canManageMediaPrivate: Access = ({ req: { user } }) =>
  isAdminOrEditor(user);

export const MediaPrivate: CollectionConfig = {
  slug: "media-private",
  labels: {
    singular: "Private Media",
    plural: "Private Media",
  },
  access: {
    read: mediaReadAccess,
    create: canManageMediaPrivate,
    update: canManageMediaPrivate,
    delete: canManageMediaPrivate,
  },
  hooks: {
    beforeOperation: [renameFile],
    beforeValidate: [generateBlurhash],
  },
  upload: {
    mimeTypes: ["image/*"],
    staticDir: "media-private",
    modifyResponseHeaders: ({ headers }) => {
      headers.set("Cache-Control", "public, max-age=31536000, immutable");
      return headers;
    },
  },
  fields: [
    {
      name: "alt",
      type: "text",
    },
    {
      name: "blurhash",
      type: "text",
      admin: {
        hidden: true,
        disableListColumn: true,
        disableListFilter: true,
      },
    },
  ],
};
