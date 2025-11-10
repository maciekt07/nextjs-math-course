import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: {
    useAsTitle: "email",
  },
  fields: [
    {
      name: "role",
      type: "select",
      options: [{ label: "Admin", value: "admin" }],
      required: true,
      defaultValue: "admin",
    },
  ],
};
