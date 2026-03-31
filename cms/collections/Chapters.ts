import type { CollectionConfig } from "payload";
import {
  revalidateChapter,
  revalidateChapterAfterDelete,
} from "@/cms/hooks/revalidateChapter";
import {
  syncChapterCourseMetadataAfterChange,
  syncChapterCourseMetadataAfterDelete,
} from "@/cms/hooks/syncCourseMetadata";

export const Chapters: CollectionConfig = {
  slug: "chapters",
  hooks: {
    afterChange: [syncChapterCourseMetadataAfterChange, revalidateChapter],
    afterDelete: [
      syncChapterCourseMetadataAfterDelete,
      revalidateChapterAfterDelete,
    ],
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "course"],
  },
  orderable: true,
  fields: [
    { name: "title", type: "text", required: true },
    {
      name: "course",
      type: "relationship",
      relationTo: "courses",
      required: true,
      admin: { description: "Which course does this chapter belong to?" },
    },
  ],
};
