"use client";

import { Button, TextareaInput, useField } from "@payloadcms/ui";
import { Eye, EyeOff, Mouse } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/ui";

const MarkdownRenderer = dynamic(
  () => import("@/components/markdown").then((mod) => mod.MarkdownRenderer),
  {
    ssr: false,
  },
);

export interface MarkdownPreviewFieldProps {
  path?: string;
  label?: string;
  rows?: number;
}

export default function MarkdownPreviewField({
  path,
  label,
  rows = 12,
}: MarkdownPreviewFieldProps) {
  const { value = "", setValue } = useField<string>({ path });
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [scrollSyncEnabled, setScrollSyncEnabled] = useState<boolean>(true);

  const debouncedValue = useDebounce(value, 500);

  const textareaRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showPreview || !scrollSyncEnabled) return;

    const textarea = textareaRef.current;
    const preview = previewRef.current;
    const isSyncing = { current: false };

    const syncScroll = (
      source: HTMLElement | null,
      target: HTMLElement | null,
    ) => {
      if (!source || !target || isSyncing.current) return;
      const ratio =
        source.scrollTop / (source.scrollHeight - source.clientHeight);
      isSyncing.current = true;
      target.scrollTop = ratio * (target.scrollHeight - target.clientHeight);
      isSyncing.current = false;
    };

    const handleTextareaScroll = () => syncScroll(textarea, preview);
    const handlePreviewScroll = () => syncScroll(preview, textarea);

    textarea?.addEventListener("scroll", handleTextareaScroll);
    preview?.addEventListener("scroll", handlePreviewScroll);

    return () => {
      textarea?.removeEventListener("scroll", handleTextareaScroll);
      preview?.removeEventListener("scroll", handlePreviewScroll);
    };
  }, [showPreview, scrollSyncEnabled]);

  return (
    <div className="flex flex-col gap-4 mb-4">
      <label>{label || "Content"}</label>

      <div className="flex items-center gap-2">
        <Button
          size="medium"
          buttonStyle="pill"
          margin={false}
          onClick={() => setShowPreview(!showPreview)}
        >
          <div className="flex items-center gap-2">
            {showPreview ? (
              <>
                <EyeOff size={16} /> Hide Preview
              </>
            ) : (
              <>
                <Eye size={16} /> Show Preview
              </>
            )}
          </div>
        </Button>

        {showPreview && (
          <Button
            size="medium"
            buttonStyle={scrollSyncEnabled ? "primary" : "pill"}
            margin={false}
            onClick={() => setScrollSyncEnabled((prev) => !prev)}
          >
            <div className="flex items-center gap-2">
              <Mouse size={16} />
              {scrollSyncEnabled ? "Scroll Sync On" : "Scroll Sync Off"}
            </div>
          </Button>
        )}
      </div>

      <div className="flex gap-4 max-h-[600px] overflow-hidden bg-[var(--theme-input-bg)] rounded-[var(--style-radius-s)]">
        <div className="flex-1 overflow-auto" ref={textareaRef}>
          <TextareaInput
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={rows}
            className={cn(
              "h-full resize-none border-none focus:ring-0",
              showPreview && "[&_textarea]:rounded-r-none",
            )}
            placeholder="Write Markdown or LaTeX here..."
            path={path || ""}
          />
        </div>

        {showPreview && (
          <div
            ref={previewRef}
            className="flex-1 overflow-auto py-2"
            style={{ contain: "layout paint" }}
          >
            {debouncedValue ? (
              <MarkdownRenderer content={debouncedValue} optimizeMath />
            ) : (
              <p className="italic">Nothing to preview yet</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
