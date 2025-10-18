"use client";

import { TextInput, useField, useFormFields } from "@payloadcms/ui";
import slugify from "@sindresorhus/slugify";
import { useEffect, useState } from "react";

type AutoSlugFieldProps = {
  path: string;
};

export default function AutoSlugField({ path }: AutoSlugFieldProps) {
  const { value, setValue } = useField<string>({ path });
  const title = useFormFields(([fields]) => fields.title?.value as string);

  const generateSlug = (text: string) =>
    slugify(text, {
      lowercase: true,
      decamelize: true,
    });

  const [autoGenerate, setAutoGenerate] = useState<boolean>(() => {
    if (!value || !title) return true;
    return value === generateSlug(title);
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: value intentionally omitted to avoid extra re-renders
  useEffect(() => {
    if (autoGenerate && title) {
      const newSlug = generateSlug(title);
      if (newSlug !== value) setValue(newSlug);
    }
  }, [title, autoGenerate, setValue]);

  return (
    <div className="mb-8 space-y-2">
      <div className={autoGenerate ? "opacity-60 pointer-events-none" : ""}>
        <TextInput
          path={path}
          value={value || ""}
          onChange={setValue}
          label="Slug"
          required
        />
      </div>

      <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
        <input
          type="checkbox"
          checked={autoGenerate}
          onChange={(e) => setAutoGenerate(e.target.checked)}
          className="cursor-pointer accent-primary"
        />
        <span>Auto-generate from title</span>
      </label>
    </div>
  );
}
