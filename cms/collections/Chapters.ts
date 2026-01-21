import type { CollectionConfig } from "payload";

export const Chapters: CollectionConfig = {
  slug: "chapters",
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
