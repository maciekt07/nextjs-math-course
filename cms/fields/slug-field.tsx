"use client";

import { TextInput, useField, useFormFields } from "@payloadcms/ui";
import type React from "react";
import { slug } from "@/lib/slugify";

type SlugFieldProps = {
  path: string;
};

export default function SlugField({ path }: SlugFieldProps) {
  const { value, setValue } = useField<string>({ path });
  const title = useFormFields(([fields]) => fields.title?.value as string);

  const generatedSlug = title ? slug(title) : "";

  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  const isValid = !value || slugRegex.test(value);

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
