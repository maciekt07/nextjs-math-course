import type { CollectionConfig } from "payload";
import { createSlugField } from "@/fields/createSlugField";

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
    createSlugField("title"),
    {
      name: "free",
      type: "checkbox",
      defaultValue: false,
      label: "Free Lesson",
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
      admin: {
        components: {
          Field: "@fields/lesson-reorder",
        },
      },
    },
    {
      name: "content",
      type: "text",
      label: "Content (Markdown + LaTeX)",
      admin: {
        components: {
          Field: "@fields/markdown-preview",
        },
      },
      required: true,
    },
  ],
};
