import type { Access, CollectionConfig } from "payload";
import { isAdmin } from "@/cms/access/roles";
import { LIMITS } from "@/lib/constants/limits";

const canManageFeedbacks: Access = ({ req: { user } }) => isAdmin(user);

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
    read: canManageFeedbacks,
    update: canManageFeedbacks,
    delete: canManageFeedbacks,
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
      maxLength: LIMITS.auth.nameMaxLength,
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
      maxLength: LIMITS.auth.emailMaxLength,
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
      maxLength: LIMITS.feedback.commentMaxLength,
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
