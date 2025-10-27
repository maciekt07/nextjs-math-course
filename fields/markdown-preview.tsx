"use client";

import { TextareaInput, useField } from "@payloadcms/ui";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { MarkdownRenderer } from "@/components/markdown-renderer";

//TODO: design better UI for preview
export default function MarkdownPreviewField({
  path,
  label,
}: {
  path: string;
  label?: string;
}) {
  const { value = "", setValue } = useField<string>({ path });
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <label>{label || "Content (Markdown + LaTeX)"} </label>

      <button
        type="button"
        onClick={() => setShowPreview(!showPreview)}
        className="flex items-center gap-1.5 self-start text-sm text-muted-foreground border border-border rounded-lg px-2.5 py-1.5 hover:bg-muted/40 transition"
      >
        {showPreview ? (
          <>
            <EyeOff className="w-4 h-4" /> Hide Preview
          </>
        ) : (
          <>
            <Eye className="w-4 h-4" /> Show Preview
          </>
        )}
      </button>
      {showPreview && (
        <div className="flex flex-col gap-3 border border-border rounded-xl p-4">
          XDDD
          <MarkdownRenderer content={value || "_Nothing to preview yet_"} />
        </div>
      )}
      <TextareaInput
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={10}
        className="max-h-5"
        placeholder="Write markdown or LaTeX here..."
        path={path}
      />
    </div>
  );
}
