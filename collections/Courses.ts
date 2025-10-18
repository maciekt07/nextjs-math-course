import type { CollectionConfig } from "payload";

export const Courses: CollectionConfig = {
  slug: "courses",
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
      unique: true,
      admin: {
        components: {
          Field: "./fields/auto-slug-field",
        },
      },
    },
    {
      name: "description",
      type: "textarea",
    },
  ],
};
