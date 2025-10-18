"use client";

import { useField } from "@payloadcms/ui";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { MarkdownRenderer } from "@/components/markdown-renderer";

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
      <label>{label || "Content (Markdown + LaTeX)"}</label>

      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={10}
        className="w-full font-mono text-sm border rounded-xl p-3 bg-background border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
        placeholder="Write markdown or LaTeX here..."
      />

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
        <div className="prose dark:prose-invert max-w-none marker:text-primary border-1 p-2 rounded-2xl">
          <MarkdownRenderer content={value || "_Nothing to preview yet..._"} />
        </div>
      )}
    </div>
  );
}
