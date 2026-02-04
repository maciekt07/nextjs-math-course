import { createSlugField } from "@fields/factories/createSlugField";
import type { Access, CollectionConfig } from "payload";
import { revalidateCourse } from "@/cms/hooks/revalidateCourse";

const isAdmin: Access = ({ req: { user } }) => user?.role === "admin";

export const Courses: CollectionConfig = {
  slug: "courses",
  orderable: true,

  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
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
  ],
};
