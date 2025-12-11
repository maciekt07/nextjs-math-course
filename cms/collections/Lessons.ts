import type { CollectionConfig } from "payload";
import { createSlugField } from "@/cms/fields/createSlugField";

export const Lessons: CollectionConfig = {
  slug: "lessons",
  admin: {
    useAsTitle: "title",
  },
  orderable: true,
  hooks: {
    beforeChange: [
      async ({ data }) => {
        if (data.content) {
          const { getReadingTime } = await import("@lib/reading-time");
          data.readingTimeSeconds = getReadingTime(data.content);
        }
        return data;
      },
    ],
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
      name: "type",
      type: "select",
      options: [
        { label: "Text", value: "text" },
        { label: "Quiz", value: "quiz" },
        { label: "Video", value: "video" },
      ],
      defaultValue: "text",
      required: true,
    },
    // TEXT LESSON CONTENT
    {
      name: "uploadImage",
      type: "upload",
      relationTo: "media",
      label: "Upload images for this lesson (/api/media/file/uuid.filetype)", // TODO: create custom field with md copy and quick delete
      hasMany: true,
      admin: {
        condition: (data) => data.type === "text",
      },
    },
    {
      name: "readingTimeSeconds",
      type: "number",
      label: "Estimated Reading Time (seconds)",
      admin: {
        readOnly: true,
        description: "Calculated automatically from content",
        condition: (data) => data.type === "text",
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
    // VIDEO LESSON CONTENT
    {
      name: "video",
      type: "relationship",
      relationTo: "mux-video",
      admin: {
        condition: (data) => data.type === "video",
      },
    },
    {
      name: "videoDescription",
      type: "textarea",
      label: "Video Description (Markdown + LaTeX)",
      admin: {
        condition: (data) => data.type === "video",
      },
    },
    {
      name: "chapters",
      type: "array",
      label: "Video Chapters",
      admin: {
        description:
          "Define chapters for the video. Each chapter has a start time, optional end time, and title.",
        condition: (data) => data.type === "video",
      },
      fields: [
        {
          name: "startTime",
          type: "number",
          label: "Start Time (seconds)",
          required: true,
        },
        {
          name: "endTime",
          type: "number",
          label: "End Time (seconds)",
          required: false,
          admin: {
            description:
              "Optional. If left empty, the chapter ends when the next chapter begins.",
          },
        },
        {
          name: "title",
          type: "text",
          label: "Chapter Title",
          required: true,
        },
      ],
    },
  ],
};
