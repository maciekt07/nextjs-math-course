import slugify from "@sindresorhus/slugify";
import type { Field } from "payload";

export const createSlugField = (titleField: string): Field => ({
  name: "slug",
  type: "text",
  unique: true,
  admin: {
    components: {
      Field: "@fields/auto-slug-field",
    },
  },
  hooks: {
    beforeValidate: [
      ({ value, data }) => {
        if (!value && data?.[titleField]) {
          return slugify(data[titleField]);
        }
        return value;
      },
    ],
  },
});
