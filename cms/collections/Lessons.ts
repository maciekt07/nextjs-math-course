import { createMarkdownField } from "@fields/factories/createMarkdownPreviewField";
import { createSlugField } from "@fields/factories/createSlugField";
import type { CollectionConfig } from "payload";
import { revalidateLesson } from "@/cms/hooks/revalidateLesson";

interface LessonData {
  course?: string | { id: string };
  [key: string]: unknown;
}

export const Lessons: CollectionConfig = {
  slug: "lessons",
  admin: {
    useAsTitle: "title",
  },
  orderable: true,
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        if (data.content) {
          const { getReadingTime } = await import("@lib/reading-time");
          data.readingTimeSeconds = getReadingTime(data.content);
        }

        if (data.type === "video" && data.video) {
          const videoId =
            typeof data.video === "string" ? data.video : data.video.id;

          const muxVideo = await req.payload.findByID({
            collection: "mux-video",
            id: videoId,
          });

          const duration = muxVideo.duration ?? null;

          if (typeof duration === "number") {
            data.videoDurationSeconds = Math.floor(duration);
          }
        }

        return data;
      },
    ],
    afterChange: [revalidateLesson],
  },

  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Setup",
          fields: [
            {
              name: "title",
              type: "text",
              required: true,
            },
            createSlugField(),
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
              name: "chapter",
              type: "relationship",
              relationTo: "chapters",
              required: false,
              admin: {
                description:
                  "Select a chapter from the course above (optional)",
                condition: (data) => Boolean((data as LessonData).course),
              },
              filterOptions: async ({ data, siblingData }) => {
                const typedData = data as LessonData;
                const typedSiblingData = siblingData as LessonData;
                const courseId = typedData?.course || typedSiblingData?.course;
                if (!courseId) return true;
                return {
                  course: {
                    equals:
                      typeof courseId === "string" ? courseId : courseId.id,
                  },
                };
              },
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
          ],
        },
        {
          label: "Lesson Content",
          fields: [
            // TEXT LESSON CONTENT
            {
              name: "uploadImage",
              type: "upload",
              relationTo: "media",
              label:
                "Upload images for this lesson (/api/media/file/uuid.filetype)", // TODO: create custom field with md copy and quick delete
              hasMany: true,
              admin: {
                condition: (data) => data.type === "text",
              },
            },
            createMarkdownField({
              name: "content",
              label: "Content",
              required: true,
              admin: {
                clientProps: { label: "Content" },
                condition: (data) => data.type === "text",
              },
            }),

            // QUIZ LESSON CONTENT
            {
              name: "quiz",
              type: "array",
              label: "Quiz Questions",
              admin: {
                condition: (data) => data.type === "quiz",
              },
              fields: [
                createMarkdownField({
                  name: "question",
                  label: "Question",
                  required: true,
                  admin: { clientProps: { label: "Question", rows: 2 } },
                }),
                {
                  name: "options",
                  type: "array",
                  label: "Answer Options",
                  minRows: 2,
                  fields: [
                    createMarkdownField({
                      name: "text",
                      label: "Option Text",
                      required: true,
                      admin: { clientProps: { label: "Option Text", rows: 1 } },
                    }),
                    {
                      name: "isCorrect",
                      type: "checkbox",
                      label: "Correct Answer?",
                      required: true,
                      defaultValue: false,
                    },
                  ],
                },
                createMarkdownField({
                  name: "hint",
                  label: "Hint (optional)",
                  admin: { clientProps: { label: "Hint (optional)", rows: 2 } },
                }),
                createMarkdownField({
                  name: "solution",
                  label: "Solution Explanation (Markdown + LaTeX)",
                  admin: { clientProps: { label: "Solution", rows: 8 } },
                }),
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
            createMarkdownField({
              name: "videoDescription",
              label: "Video Description (Markdown + LaTeX)",
              admin: {
                clientProps: { label: "Video Description", rows: 8 },
                condition: (data) => data.type === "video",
              },
            }),
            {
              name: "videoChapters",
              type: "array",
              defaultValue: undefined,
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
        },
        {
          label: "Metadata",
          fields: [
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
              name: "videoDurationSeconds",
              type: "number",
              label: "Video Duration (seconds)",
              admin: {
                readOnly: true,
                condition: (data) => data.type === "video",
              },
            },
          ],
        },
      ],
    },
  ],
};
