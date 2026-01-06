import type { Field } from "payload";
import { slug } from "@/lib/slugify";

export const createSlugField = (titleField: string = "title"): Field => ({
  name: "slug",
  type: "text",
  unique: true,
  admin: {
    components: {
      Field: "@fields/slug-field",
    },
  },
  hooks: {
    beforeValidate: [
      ({ value, data }) => {
        if (!value && data?.[titleField]) {
          return slug(data[titleField]);
        }
        return value;
      },
    ],
  },
});
