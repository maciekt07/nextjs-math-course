type ClassificationOption = {
  label: string;
  description: string;
};

export const feedbackClassification = {
  importance: {
    low: {
      label: "Low",
      description:
        "Minor preference, compliment, or issue with little impact on learning.",
    },
    normal: {
      label: "Normal",
      description:
        "Useful feedback that should be considered during normal course maintenance.",
    },
    high: {
      label: "High",
      description:
        "A meaningful issue affecting understanding, correctness, or a substantial number of learners.",
    },
    urgent: {
      label: "Urgent",
      description:
        "A severe correctness, access, safety, or learner-blocking issue requiring prompt attention.",
    },
  },
  category: {
    bug: {
      label: "Bug",
      description:
        "Reports an error, broken behavior, incorrect result, or technical defect.",
    },
    content: {
      label: "Content",
      description:
        "Comments on the explanation, examples, difficulty, correctness, or missing content.",
    },
    question: {
      label: "Question",
      description: "Asks for clarification or expresses a learner question.",
    },
    usability: {
      label: "Usability",
      description:
        "Concerns navigation, presentation, accessibility, or ease of use.",
    },
    praise: {
      label: "Praise",
      description:
        "Primarily positive appreciation without a concrete issue or request.",
    },
    other: {
      label: "Other",
      description: "Does not fit the other categories.",
    },
  },
  sentiment: {
    positive: {
      label: "Positive",
      description: "Mostly appreciative or satisfied.",
    },
    neutral: {
      label: "Neutral",
      description:
        "Factual or balanced without a clear positive or negative tone.",
    },
    negative: {
      label: "Negative",
      description: "Mostly dissatisfied, frustrated, or critical.",
    },
    mixed: {
      label: "Mixed",
      description: "Contains substantial positive and negative sentiment.",
    },
  },
} as const satisfies Record<
  "importance" | "category" | "sentiment",
  Record<string, ClassificationOption>
>;

export const feedbackClassificationStatus = {
  pending: { label: "Pending" },
  processing: { label: "Processing" },
  classified: { label: "Classified" },
  skipped: { label: "Skipped" },
  failed: { label: "Failed" },
} as const;

type TypeSafeOptions<T extends Record<string, ClassificationOption>> = {
  [K in keyof T]: T[K]["description"];
};

export function toTypeSafeOptions<
  T extends Record<string, ClassificationOption>,
>(options: T): TypeSafeOptions<T> {
  return Object.fromEntries(
    Object.entries(options).map(([value, option]) => [
      value,
      option.description,
    ]),
  ) as TypeSafeOptions<T>;
}

export function toPayloadOptions<T extends Record<string, { label: string }>>(
  options: T,
) {
  return Object.entries(options).map(([value, option]) => ({
    label: option.label,
    value,
  }));
}
