import type { MarkdownPreviewFieldProps } from "@fields/markdown-preview-field";
import type { TextareaField } from "payload";

export type MarkdownFieldOptions = Omit<TextareaField, "type" | "admin"> & {
  admin?: Partial<TextareaField["admin"]> & {
    clientProps?: MarkdownPreviewFieldProps;
  };
};

export const createMarkdownField = (
  options: MarkdownFieldOptions,
): TextareaField => {
  const { admin, ...rest } = options;

  return {
    type: "textarea",
    ...rest,
    admin: {
      ...admin,
      components: {
        Field: {
          path: "@fields/markdown-preview-field",
          clientProps: admin?.clientProps ?? {},
        },
      },
    },
  };
};
