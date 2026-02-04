import type { CollectionConfig } from "payload";
import { extractPalette } from "@/cms/hooks/extractPalette";
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
    afterChange: [extractPalette],
  },
  upload: {
    mimeTypes: ["image/*"],
    staticDir: "media",
  },
  fields: [
    {
      name: "kind",
      type: "select",
      required: true,
      defaultValue: "other",
      options: [
        { label: "Poster", value: "poster" },
        { label: "Other image", value: "other" },
      ],
    },
    {
      name: "alt",
      type: "text",
    },
    {
      name: "palette",
      type: "group",
      admin: {
        condition: (_, siblingData) => siblingData?.kind === "poster",
        description: "Auto-generated color palette (poster only)",
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
