import type { Access, CollectionConfig } from "payload";
import { AUTH_LIMITS, FEEDBACK_LIMITS } from "@/lib/constants/limits";

const isAdmin: Access = ({ req: { user } }) => user?.role === "admin";
export const Feedbacks: CollectionConfig = {
  slug: "feedback",
  defaultSort: "seen",
  admin: {
    useAsTitle: "id",
    description: "User feedback for lessons",
    defaultColumns: [
      "id",
      "reaction",
      "lesson",
      "comment",
      "userEmail",
      "seen",
    ],
  },
  access: {
    create: () => false,
    read: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: "lesson",
      type: "relationship",
      relationTo: "lessons",
      required: true,
      index: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: "userName",
      type: "text",
      required: true,
      maxLength: AUTH_LIMITS.name,
      admin: {
        readOnly: true,
      },
    },
    {
      name: "userId",
      type: "text",
      required: true,
      index: true,
      maxLength: 40,
      admin: {
        readOnly: true,
      },
    },
    {
      name: "userEmail",
      type: "text",
      required: true,
      index: true,
      maxLength: AUTH_LIMITS.email,
      admin: {
        readOnly: true,
      },
    },
    {
      name: "reaction",
      type: "number",
      required: true,
      min: 1,
      max: 4,
      admin: {
        description: "1 = Poor, 2 = Fair, 3 = Good, 4 = Excellent",
        readOnly: true,
      },
    },
    {
      name: "comment",
      type: "textarea",
      required: false,
      maxLength: FEEDBACK_LIMITS.comment,
      admin: {
        readOnly: true,
      },
    },
    {
      name: "seen",
      type: "checkbox",
      label: "Seen",
      required: false,
      defaultValue: false,
      admin: {
        description:
          "Mark this feedback as seen. Seen feedbacks will appear at the end.",
      },
    },
  ],
  timestamps: true,
};
