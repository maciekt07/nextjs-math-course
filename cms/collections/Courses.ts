import type { Access, CollectionConfig } from "payload";
import { createSlugField } from "@/cms/fields/createSlugField";

const isAdmin: Access = ({ req: { user } }) => user?.role === "admin";

export const Courses: CollectionConfig = {
  slug: "courses",
  orderable: true,
  // only admin can manage courses
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
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
    {
      name: "media",
      type: "upload",
      relationTo: "media",
    },
  ],
};
