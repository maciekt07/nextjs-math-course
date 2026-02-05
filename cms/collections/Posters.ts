import type { CollectionConfig } from "payload";
import { extractPalette } from "@/cms/hooks/extractPalette";
import { generateBlurhash } from "@/cms/hooks/generateBlurhash";
import { renameFile } from "../hooks/renameFile";

export const Posters: CollectionConfig = {
  slug: "posters",
  access: {
    read: () => true,
  },
  hooks: {
    beforeOperation: [renameFile],
    beforeValidate: [generateBlurhash],
    afterChange: [extractPalette],
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
      name: "palette",
      type: "group",
      admin: {
        description: "Auto-generated color palette",
        readOnly: true,
      },
      fields: [
        {
          name: "dominant",
          type: "text",
          admin: { readOnly: true },
        },
        {
          name: "vibrant",
          type: "text",
          admin: { readOnly: true },
        },
        {
          name: "darkVibrant",
          type: "text",
          admin: { readOnly: true },
        },
        {
          name: "lightVibrant",
          type: "text",
          admin: { readOnly: true },
        },
        {
          name: "muted",
          type: "text",
          admin: { readOnly: true },
        },
      ],
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
