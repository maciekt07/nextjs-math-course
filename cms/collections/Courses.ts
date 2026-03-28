import { createSlugField } from "@fields/factories/createSlugField";
import type { Access, CollectionConfig } from "payload";
import {
  isPayloadAdmin,
  publicPublishedReadAccess,
} from "@/cms/access/contentAccess";
import { revalidateCourse } from "@/cms/hooks/revalidateCourse";

const isAdmin: Access = ({ req: { user } }) => isPayloadAdmin(user);

export const Courses: CollectionConfig = {
  slug: "courses",
  orderable: true,

  access: {
    read: publicPublishedReadAccess,
    readVersions: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  versions: {
    drafts: true,
  },
  hooks: {
    afterChange: [revalidateCourse],
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "media", "description", "price"],
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    createSlugField(),
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
    {
      name: "poster",
      type: "upload",
      relationTo: "posters",
    },
    {
      type: "collapsible",
      label: "Metadata",
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: "lessonCount",
          type: "number",
          admin: {
            readOnly: true,
          },
          defaultValue: 0,
        },
        {
          name: "totalQuizQuestions",
          type: "number",
          admin: {
            readOnly: true,
          },
          defaultValue: 0,
        },
        {
          name: "totalReadingTimeSeconds",
          type: "number",
          admin: {
            readOnly: true,
          },
          defaultValue: 0,
        },
        {
          name: "totalVideoSeconds",
          type: "number",
          admin: {
            readOnly: true,
          },
          defaultValue: 0,
        },
        {
          name: "firstLessonSlug",
          type: "text",
          admin: {
            readOnly: true,
          },
        },
        {
          name: "firstFreeLessonSlug",
          type: "text",
          admin: {
            readOnly: true,
          },
        },
      ],
    },
  ],
};
