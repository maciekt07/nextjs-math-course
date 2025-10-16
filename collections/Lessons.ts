import type { CollectionConfig } from "payload";

export const Lessons: CollectionConfig = {
  slug: "lessons",
  admin: {
    useAsTitle: "title",
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
    },
    {
      name: "course",
      type: "relationship",
      relationTo: "courses",
      required: true,
    },
    {
      name: "order",
      type: "number",
      required: true,
    },
    {
      name: "free",
      type: "checkbox",
      defaultValue: false,
    },
    {
      name: "content",
      type: "textarea",
      required: true,
    },
  ],
};
