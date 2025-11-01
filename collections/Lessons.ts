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
      name: "type",
      type: "select",
      options: [
        { label: "Text", value: "text" },
        { label: "Quiz", value: "quiz" },
      ],
      defaultValue: "text",
      required: true,
    },
    // TEXT LESSON CONTENT
    {
      name: "content",
      type: "text",
      label: "Content (Markdown + LaTeX)",
      admin: {
        components: {
          Field: "@fields/markdown-preview",
        },
        condition: (data) => data.type === "text",
      },
      required: true,
    },
    // QUIZ LESSON CONTENT
    {
      name: "quiz",
      type: "array",
      label: "Quiz Questions",
      admin: {
        condition: (data) => data.type === "quiz",
      },
      fields: [
        {
          name: "question",
          type: "textarea",
          label: "Question (Markdown + LaTeX)",
          required: true,
        },
        {
          name: "options",
          type: "array",
          label: "Answer Options",
          required: true,
          minRows: 2,
          fields: [
            {
              name: "text",
              type: "text",
              label: "Option Text",
              required: true,
            },
            {
              name: "isCorrect",
              type: "checkbox",
              label: "Correct Answer?",
              required: true,
              defaultValue: false,
            },
          ],
        },
        {
          name: "hint",
          type: "text",
          label: "Hint (optional)",
        },
        {
          name: "solution",
          type: "textarea",
          label: "Solution Explanation (Markdown + LaTeX)",
        },
      ],
    },
  ],
};
