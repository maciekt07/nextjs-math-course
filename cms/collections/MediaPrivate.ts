import type {
  Access,
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionConfig,
} from "payload";
import { invalidateMediaAccessCache } from "@/cms/access/mediaAccess";
import { isAdminOrEditor } from "@/cms/access/roles";
import { generateBlurhash } from "@/cms/hooks/generateBlurhash";
import type { MediaPrivate as MediaPrivateDoc } from "@/types/payload-types";
import { mediaReadAccess } from "../access/mediaAccess";
import { renameFile } from "../hooks/renameFile";

const canManageMediaPrivate: Access = ({ req: { user } }) =>
  isAdminOrEditor(user);

const invalidateMediaMetadataAfterChange: CollectionAfterChangeHook<
  MediaPrivateDoc
> = async ({ doc, previousDoc }) => {
  await invalidateMediaAccessCache([doc.filename, previousDoc?.filename]);
  return doc;
};

const invalidateMediaMetadataAfterDelete: CollectionAfterDeleteHook<
  MediaPrivateDoc
> = async ({ doc }) => {
  await invalidateMediaAccessCache([doc.filename]);
  return doc;
};

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
    afterChange: [invalidateMediaMetadataAfterChange],
    afterDelete: [invalidateMediaMetadataAfterDelete],
  },
  upload: {
    mimeTypes: ["image/*"],
    staticDir: "media-private",
    modifyResponseHeaders: ({ headers }) => {
      headers.set("Cache-Control", "private, no-store");
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
