import type { CollectionConfig } from "payload";
import { posterReadAccess } from "@/cms/access/posterAccess";
import { extractPalette } from "@/cms/hooks/extractPalette";
import { generateBlurhash } from "@/cms/hooks/generateBlurhash";
import { renameFile } from "../hooks/renameFile";

export const Posters: CollectionConfig = {
  slug: "posters",
  access: {
    read: posterReadAccess,
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
      name: "isPublic",
      type: "checkbox",
      defaultValue: false,
      admin: {
        readOnly: true,
        description:
          "Managed automatically. Public posters are attached to at least one published course.",
      },
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
