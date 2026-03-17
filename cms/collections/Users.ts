import type { CollectionConfig } from "payload";
import CustomAPIError from "../CustomAPIError";

export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: {
    useAsTitle: "email",
  },
  // auth: {
  //   forgotPassword: {
  //     expiration: forgotPasswordTokenTTL,
  //     generateEmailHTML: async (args) => {
  //       const { token, user } = args ?? {};
  //       const resetUrl = `${clientEnv.NEXT_PUBLIC_APP_URL}/admin/reset/${token}`;
  //       const html = `
  //       <p>Hello,</p>
  //       <p>Click the link below to reset your password:</p>
  //       <a href="${resetUrl}">${resetUrl}</a>
  //       <p>This link will expire in ${formatSeconds(forgotPasswordTokenTTL / 1000)}.</p>
  //     `;
  //       await resend.emails.send({
  //         from: `Math Course Online <${serverEnv.RESEND_FROM_EMAIL}>`,
  //         to: user?.email as string,
  //         subject: "Reset your admin password",
  //         html,
  //       });
  //       return html;
  //     },
  //   },
  // },
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
      // hide on initial account setup
      admin: {
        condition: ({ id }) => Boolean(id),
      },
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
