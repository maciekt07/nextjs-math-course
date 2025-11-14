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
  fields: [
    {
      name: "alt",
      type: "text",
    },
    // { // TODO: make blur generation optional
    //   name: "generateBlur",
    //   type: "checkbox",
    //   label: "Generate Blur Placeholder",
    //   defaultValue: true,
    //   admin: {
    //     description:
    //       "Automatically create a blurred placeholder for this image.",
    //   },
    // },
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
  upload: {
    mimeTypes: ["image/*"],
    staticDir: "media",
  },
};
