import type { CollectionConfig } from "payload";
import CustomAPIError from "../CustomAPIError";

export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: {
    useAsTitle: "email",
  },
  access: {
    // only admins can read all users but each user can read their own record
    read: ({ req }) => {
      const user = req.user;
      if (!user) return false;
      if (user.role === "admin") return true;
      return { id: { equals: user.id } };
    },
    create: ({ req }) => req.user?.role === "admin",
    update: ({ req, id }) => {
      const user = req.user;
      if (!user) return false;
      if (user.role === "admin") return true;
      return id === user.id;
    },

    delete: ({ req }) => req.user?.role === "admin",
  },
  fields: [
    {
      name: "role",
      type: "select",
      options: [
        { label: "Admin", value: "admin" },
        { label: "Editor", value: "editor" },
      ],
      required: true,
      defaultValue: "admin",
      access: {
        update: ({ req }) => req.user?.role === "admin",
      },
    },
  ],

  hooks: {
    beforeChange: [
      async ({ data, req, originalDoc }) => {
        if (
          originalDoc.role === "admin" &&
          data.role &&
          data.role !== "admin"
        ) {
          const { totalDocs } = await req.payload.find({
            collection: "users",
            where: { role: { equals: "admin" } },
            limit: 0,
          });

          if (totalDocs <= 1) {
            throw new CustomAPIError("You cannot demote the last admin.");
          }
        }
        return data;
      },
    ],
    beforeDelete: [
      async ({ req, id }) => {
        const userToDelete = await req.payload.findByID({
          collection: "users",
          id,
        });

        if (userToDelete?.role === "admin") {
          const { totalDocs } = await req.payload.find({
            collection: "users",
            where: { role: { equals: "admin" } },
            limit: 0,
          });

          if (totalDocs <= 1) {
            throw new CustomAPIError("You cannot delete the last admin.");
          }
        }
      },
    ],
  },
};
