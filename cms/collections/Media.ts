import type { CollectionConfig } from "payload";
import { generateBlurhash } from "@/cms/hooks/generateBlurhash";
import { mediaReadAccess } from "../access/mediaAccess";
import { renameFile } from "../hooks/renameFile";

export const Media: CollectionConfig = {
  slug: "media",
  access: {
    read: mediaReadAccess,
  },
  hooks: {
    beforeOperation: [renameFile],
    beforeValidate: [generateBlurhash],
  },
  upload: {
    mimeTypes: ["image/*"],
    staticDir: "media",
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
