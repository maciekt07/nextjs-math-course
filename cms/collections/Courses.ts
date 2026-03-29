import { createSlugField } from "@fields/factories/createSlugField";
import type { Access, CollectionConfig } from "payload";
import { publicPublishedReadAccess } from "@/cms/access/contentAccess";
import { isAdmin } from "@/cms/access/roles";
import { revalidateCourse } from "@/cms/hooks/revalidateCourse";
import {
  syncCoursePosterVisibilityAfterChange,
  syncCoursePosterVisibilityAfterDelete,
} from "@/cms/hooks/syncPosterVisibility";

const canManageCourses: Access = ({ req: { user } }) => isAdmin(user);

export const Courses: CollectionConfig = {
  slug: "courses",
  orderable: true,

  access: {
    read: publicPublishedReadAccess,
    readVersions: canManageCourses,
    create: canManageCourses,
    update: canManageCourses,
    delete: canManageCourses,
  },
  versions: {
    drafts: true,
  },
  hooks: {
    afterChange: [syncCoursePosterVisibilityAfterChange, revalidateCourse],
    afterDelete: [syncCoursePosterVisibilityAfterDelete],
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
