"use client";

import { TextInput, useField, useFormFields } from "@payloadcms/ui";
import slugify from "@sindresorhus/slugify";
import type React from "react";

type AutoSlugFieldProps = {
  path: string;
};

export default function AutoSlugField({ path }: AutoSlugFieldProps) {
  const { value, setValue } = useField<string>({ path });
  const title = useFormFields(([fields]) => fields.title?.value as string);

  const generatedSlug = title
    ? slugify(title, { lowercase: true, decamelize: true })
    : "";

  // Regex for a valid slug: lowercase letters, numbers, dashes only
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  const isValid = !value || slugRegex.test(value); // empty value is okay, backend will generate

  return (
    <TextInput
      path={path}
      label="Slug"
      description="Automatically generated from the title if left empty."
      value={value || ""}
      placeholder={!value ? generatedSlug : ""}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
      }}
      Error={
        !isValid
          ? "Invalid slug: only lowercase letters, numbers, and dashes are allowed."
          : undefined
      }
    />
  );
}
