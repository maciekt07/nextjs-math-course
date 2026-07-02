import type { Access, CollectionConfig } from "payload";
import { isAdminOrEditor } from "@/cms/access/roles";
import { generateBlurhash } from "@/cms/hooks/generateBlurhash";
import { renameFile } from "../hooks/renameFile";

const canManageMediaPublic: Access = ({ req: { user } }) =>
  isAdminOrEditor(user);

export const MediaPublic: CollectionConfig = {
  slug: "media-public",
  labels: {
    singular: "Public Media",
    plural: "Public Media",
  },
  access: {
    read: () => true,
    create: canManageMediaPublic,
    update: canManageMediaPublic,
    delete: canManageMediaPublic,
  },
  hooks: {
    beforeOperation: [renameFile],
    beforeValidate: [generateBlurhash],
  },
  upload: {
    mimeTypes: ["image/*"],
    staticDir: "media-public",
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
