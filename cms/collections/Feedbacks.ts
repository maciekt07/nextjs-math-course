import type { Access, CollectionConfig } from "payload";

import { isAdmin } from "@/cms/access/roles";
import { queueFeedbackClassification } from "@/cms/hooks/queueFeedbackClassification";
import { LIMITS } from "@/lib/constants/limits";
import { reactions } from "@/lib/constants/reactions";

const canManageFeedbacks: Access = ({ req: { user } }) => isAdmin(user);

export const Feedbacks: CollectionConfig = {
  slug: "feedback",
  defaultSort: "seen",
  timestamps: true,
  admin: {
    useAsTitle: "id",
    description: "User feedback for lessons",
    defaultColumns: [
      "id",
      "reaction",
      "lesson",
      "comment",
      "userEmail",
      "classificationStatus",
      "importance",
      "spam",
      "seen",
    ],
  },
  access: {
    create: () => false,
    read: canManageFeedbacks,
    update: canManageFeedbacks,
    delete: canManageFeedbacks,
  },
  hooks: {
    afterChange: [queueFeedbackClassification],
  },

  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Feedback",
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
                description: reactions
                  .map((r) => `${r.value} = ${r.label}`)
                  .join(", "),
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
        },
        {
          label: "Classification",
          fields: [
            {
              name: "classificationStatus",
              type: "select",
              required: false,
              defaultValue: "pending",
              options: [
                { label: "Pending", value: "pending" },
                { label: "Processing", value: "processing" },
                { label: "Classified", value: "classified" },
                { label: "Skipped", value: "skipped" },
                { label: "Failed", value: "failed" },
              ],
              admin: {
                description:
                  "Status of the automated feedback classification job.",
                readOnly: true,
              },
            },
            {
              name: "importance",
              type: "select",
              options: [
                { label: "Low", value: "low" },
                { label: "Normal", value: "normal" },
                { label: "High", value: "high" },
                { label: "Urgent", value: "urgent" },
              ],
              admin: {
                description:
                  "Estimated importance based on the learner's feedback.",
                readOnly: true,
              },
            },
            {
              name: "spam",
              type: "checkbox",
              admin: {
                description: "Whether the feedback appears to be spam.",
                readOnly: true,
              },
            },
            {
              name: "category",
              type: "select",
              options: [
                { label: "Bug", value: "bug" },
                { label: "Content", value: "content" },
                { label: "Question", value: "question" },
                { label: "Usability", value: "usability" },
                { label: "Praise", value: "praise" },
                { label: "Other", value: "other" },
              ],
              admin: {
                description: "Primary topic of the feedback.",
                readOnly: true,
              },
            },
            {
              name: "sentiment",
              type: "select",
              options: [
                { label: "Positive", value: "positive" },
                { label: "Neutral", value: "neutral" },
                { label: "Negative", value: "negative" },
                { label: "Mixed", value: "mixed" },
              ],
              admin: {
                description: "Overall tone of the feedback.",
                readOnly: true,
              },
            },
            {
              name: "classificationConfidence",
              type: "number",
              min: 0,
              max: 1,
              admin: {
                description:
                  "Confidence for categorical classifications (0 to 1).",
                readOnly: true,
              },
            },
            {
              name: "spamProbability",
              type: "number",
              min: 0,
              max: 1,
              admin: {
                description: "Probability that the feedback is spam (0 to 1).",
                readOnly: true,
              },
            },
            {
              name: "actionableProbability",
              type: "number",
              min: 0,
              max: 1,
              admin: {
                description:
                  "Probability that feedback requires follow-up (0 to 1).",
                readOnly: true,
              },
            },
            {
              name: "classificationProbabilities",
              type: "json",
              admin: {
                description:
                  "Raw TypeSafe probability distributions for auditability.",
                readOnly: true,
              },
            },
            {
              name: "classificationModel",
              type: "text",
              admin: {
                readOnly: true,
              },
            },
            {
              name: "classifiedAt",
              type: "date",
              admin: {
                readOnly: true,
              },
            },
            {
              name: "classificationError",
              type: "textarea",
              admin: {
                description: "Most recent classification failure, if any.",
                readOnly: true,
              },
            },
          ],
        },
      ],
    },
  ],
};
