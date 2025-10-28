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
      name: "price",
      label: "Price",
      type: "number",
      required: true,
    },
    {
      name: "description",
      type: "textarea",
    },
  ],
};
