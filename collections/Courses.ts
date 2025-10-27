import type { CollectionConfig } from "payload";
import { createSlugField } from "@/fields/createSlugField";

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
    createSlugField("title"),
    {
      name: "description",
      type: "textarea",
    },
  ],
};
