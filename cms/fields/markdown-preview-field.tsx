"use client";
import { Button, useField, useTheme } from "@payloadcms/ui";
import { AlertCircle, Eye, EyeOff, Mouse } from "lucide-react";
import dynamic from "next/dynamic";
import { startTransition, useEffect, useRef, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import {
  type MarkdownError,
  validateMarkdown,
} from "@/lib/markdown/validate-markdown";
import { cn } from "@/lib/ui";
import "@uiw/react-md-editor/markdown-editor.css";

const MarkdownRenderer = dynamic(
  () => import("@/components/markdown").then((mod) => mod.MarkdownRenderer),
  { ssr: false },
);

const MarkdownEditor = dynamic(
  () => import("@uiw/react-md-editor/common").then((mod) => mod.default),
  { ssr: false },
);

const ROW_HEIGHT_PX = 21;

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
  const { theme } = useTheme();

  const [localValue, setLocalValue] = useState<string>(value);

  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [hasRenderedPreview, setHasRenderedPreview] = useState(false);

  const [scrollSyncEnabled, setScrollSyncEnabled] = useState<boolean>(true);
  const [errors, setErrors] = useState<MarkdownError[]>([]);
  const isValidating = useRef<boolean>(false);
  const pendingValidation = useRef<string | null>(null);
  const isMounted = useRef<boolean>(true);

  const debouncedValue = useDebounce(localValue, 500);

  const textareaRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const isInternalUpdate = useRef<boolean>(false);

  const handleChange = (val?: string) => setLocalValue(val ?? "");

  // biome-ignore lint/correctness/useExhaustiveDependencies: safe
  useEffect(() => {
    if (debouncedValue !== value) {
      isInternalUpdate.current = true;
      setValue(debouncedValue);
    }
  }, [debouncedValue]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: safe
  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    if (value !== localValue) setLocalValue(value ?? "");
  }, [value]);

  const togglePreview = () => {
    if (!hasRenderedPreview) setHasRenderedPreview(true);
    startTransition(() => setShowPreview((prev) => !prev));
  };

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
      const denom = source.scrollHeight - source.clientHeight;
      if (denom <= 0) return;
      const ratio = source.scrollTop / denom;
      isSyncing.current = true;
      target.scrollTop = ratio * (target.scrollHeight - target.clientHeight);
      isSyncing.current = false;
    };
    const handleTextareaScroll = () => syncScroll(textarea, preview);
    const handlePreviewScroll = () => syncScroll(preview, textarea);
    textarea?.addEventListener("scroll", handleTextareaScroll, {
      passive: true,
    });
    preview?.addEventListener("scroll", handlePreviewScroll, {
      passive: true,
    });
    return () => {
      textarea?.removeEventListener("scroll", handleTextareaScroll);
      preview?.removeEventListener("scroll", handlePreviewScroll);
    };
  }, [showPreview, scrollSyncEnabled]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    pendingValidation.current = debouncedValue;

    async function validate() {
      if (isValidating.current) return;
      isValidating.current = true;
      try {
        while (pendingValidation.current !== null) {
          const valueToValidate = pendingValidation.current;
          pendingValidation.current = null;
          const result = await validateMarkdown(valueToValidate);
          if (isMounted.current) setErrors(result);
        }
      } finally {
        isValidating.current = false;
      }
    }

    validate();
  }, [debouncedValue]);

  return (
    <div className="flex flex-col gap-4 mb-4">
      <label className="font-medium">{label || "Content"}</label>
      <div className="flex items-center gap-2">
        <Button
          size="medium"
          buttonStyle="pill"
          margin={false}
          onClick={togglePreview}
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
      <div
        data-color-mode={theme === "dark" ? "dark" : "light"}
        className={cn(
          "flex max-h-[600px] overflow-hidden transition-colors",
          "bg-[var(--theme-input-bg)] rounded-[var(--style-radius-s)] border border-[var(--theme-elevation-150)] focus-within:border-[var(--theme-elevation-400)]",
          errors.length > 0 && "border-red-300! dark:border-red-900/50!",
        )}
      >
        <div className="flex-1 overflow-auto" ref={textareaRef}>
          <MarkdownEditor
            value={localValue}
            onChange={handleChange}
            preview="edit"
            hideToolbar
            visibleDragbar={false}
            height="auto"
            minHeight={rows * ROW_HEIGHT_PX}
            spellCheck
            textareaProps={{
              placeholder: "Write Markdown or LaTeX here...",
              name: path,
            }}
            className={cn(
              "!bg-transparent !shadow-none w-full",
              showPreview && "!rounded-r-none",
            )}
          />
        </div>

        {hasRenderedPreview && (
          <div
            ref={previewRef}
            className={cn(
              "flex-1 overflow-auto [&_p]:mt-0! border-l border-[var(--theme-elevation-150)] px-2 py-2",
              !showPreview && "hidden",
            )}
            style={{ contain: "layout paint" }}
          >
            {debouncedValue ? (
              <MarkdownRenderer
                content={debouncedValue}
                optimizeMath
                useSections
              />
            ) : (
              <p className="italic text-gray-500 dark:text-gray-400">
                Nothing to preview yet
              </p>
            )}
          </div>
        )}
      </div>
      {errors.length > 0 && (
        <div className="flex flex-col gap-2 rounded-[var(--style-radius-s)] border border-red-300 bg-red-50 px-4 py-3 text-red-900 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-200">
          <div className="flex items-center gap-2 font-semibold">
            <AlertCircle size={16} className="text-red-600 dark:text-red-400" />
            <span>
              {errors.length} syntax error{errors.length > 1 ? "s" : ""}{" "}
              detected
            </span>
          </div>
          <ul className="ml-6 flex max-h-32 flex-col gap-1 overflow-y-auto list-disc opacity-90">
            {errors.map((e, i) => (
              <li
                // biome-ignore lint/suspicious/noArrayIndexKey: safe
                key={`${e.type}-${i}`}
              >
                <span className="font-semibold">{e.type}</span>: {e.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
