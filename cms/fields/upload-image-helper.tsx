"use client";

import { Button, useField } from "@payloadcms/ui";
import { Copy, ImageIcon, Trash } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Media } from "@/types/payload-types";

type UploadValue =
  | Media
  | File
  | {
      id?: string;
      value?: string | Media;
    }
  | string
  | null
  | undefined;

type UploadImageHelperProps = {
  path: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isMediaDoc = (value: unknown): value is Media =>
  isRecord(value) && typeof value.id === "string";

const getItemId = (item: UploadValue) => {
  if (typeof item === "string") return item;
  if (item instanceof File) return null;
  if (!isRecord(item)) return null;

  if (typeof item.id === "string") return item.id;
  if (typeof item.value === "string") return item.value;
  if (isMediaDoc(item.value)) return item.value.id;

  return null;
};

const getResolvedMedia = (
  item: UploadValue,
  mediaById: Record<string, Media>,
): Media | null => {
  if (isMediaDoc(item)) return item;
  if (isRecord(item) && isMediaDoc(item.value)) return item.value;

  const id = getItemId(item);
  return id ? (mediaById[id] ?? null) : null;
};

const buildMediaPath = (media: Media) => {
  if (!media.filename) return null;
  return `/api/media/file/${media.filename}`;
};

const getDefaultAlt = (media: Media) => {
  if (media.alt?.trim()) return media.alt.trim();
  if (media.filename) {
    return media.filename
      .replace(/\.[^/.]+$/, "")
      .replace(/[-_]+/g, " ")
      .trim();
  }

  return "Lesson image";
};

const escapeMarkdownAlt = (alt: string) => alt.replace(/[[\]\\]/g, "\\$&");

export default function UploadImageHelper({ path }: UploadImageHelperProps) {
  const { value, setValue } = useField<UploadValue[] | null>({ path });
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [mediaById, setMediaById] = useState<Record<string, Media>>({});

  const mediaItems = Array.isArray(value) ? value : [];

  const idsToFetch = useMemo(() => {
    return mediaItems
      .map((item) => {
        const media = getResolvedMedia(item, mediaById);
        if (media?.filename) return null;
        return getItemId(item);
      })
      .filter((id): id is string => Boolean(id));
  }, [mediaById, mediaItems]);

  useEffect(() => {
    if (idsToFetch.length === 0) return;

    let isCancelled = false;

    const fetchMedia = async () => {
      const entries = await Promise.all(
        idsToFetch.map(async (id) => {
          try {
            const response = await fetch(`/api/media/${id}`, {
              credentials: "same-origin",
            });

            if (!response.ok) return null;

            const doc = (await response.json()) as Media;
            return [id, doc] as const;
          } catch (error) {
            console.error(`Failed to fetch media ${id}`, error);
            return null;
          }
        }),
      );

      if (isCancelled) return;

      setMediaById((current) => {
        const next = { ...current };

        for (const entry of entries) {
          if (!entry) continue;
          next[entry[0]] = entry[1];
        }

        return next;
      });
    };

    void fetchMedia();

    return () => {
      isCancelled = true;
    };
  }, [idsToFetch]);

  if (mediaItems.length === 0) {
    return (
      <div className="rounded-[var(--style-radius-m)] border border-dashed border-[var(--theme-elevation-150)] px-4 py-3 text-sm text-[var(--theme-text)] opacity-75">
        Uploaded lesson images will appear here.
      </div>
    );
  }

  const copyMarkdown = async (markdown: string) => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopiedPath(markdown);

      window.setTimeout(() => {
        setCopiedPath((current) => (current === markdown ? null : current));
      }, 1800);
    } catch (error) {
      console.error("Failed to copy media markdown", error);
    }
  };

  const removeMedia = async (mediaId: string) => {
    try {
      setDeletingId(mediaId);

      const response = await fetch(`/api/media/${mediaId}`, {
        method: "DELETE",
        credentials: "same-origin",
      });

      if (!response.ok) {
        throw new Error(`Failed to delete media ${mediaId}`);
      }

      setValue(
        mediaItems.filter((item) => {
          const itemId = getItemId(item);
          return itemId ? itemId !== mediaId : true;
        }),
      );

      setMediaById((current) => {
        const next = { ...current };
        delete next[mediaId];
        return next;
      });
    } catch (error) {
      console.error("Failed to remove media", error);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="rounded-[var(--style-radius-s)] border border-[var(--theme-elevation-150)] bg-[var(--theme-elevation-50)] p-4 mt-2">
      <div className="mb-4 text-sm font-medium">Uploaded images</div>

      <div className="flex flex-col gap-2">
        {mediaItems.map((item, index) => {
          const media = getResolvedMedia(item, mediaById);

          if (!media) {
            const pendingName = item instanceof File ? item.name : null;

            return (
              <div
                key={`${getItemId(item) ?? pendingName ?? "pending"}-${
                  // biome-ignore lint/suspicious/noArrayIndexKey: safe
                  index
                }`}
                className="rounded-[var(--style-radius-s)] border border-[var(--theme-elevation-150)] px-3 py-2 text-sm opacity-75"
              >
                {pendingName
                  ? `Uploading ${pendingName}...`
                  : "Loading image details..."}
              </div>
            );
          }

          const mediaPath = buildMediaPath(media);
          const altText = getDefaultAlt(media);
          const markdown = mediaPath
            ? `![${escapeMarkdownAlt(altText)}](${mediaPath})`
            : null;
          const previewSrc = mediaPath || media.url || null;

          return (
            <div
              key={media.id}
              className="flex items-center gap-3 rounded-[var(--style-radius-s)] border border-[var(--theme-elevation-150)] bg-[var(--theme-bg)] px-3 py-2"
            >
              {previewSrc ? (
                // biome-ignore lint/performance/noImgElement: ensures img loads instantly
                <img
                  alt={altText}
                  className="h-12 w-12 shrink-0 rounded-[var(--style-radius-s)] border border-[var(--theme-elevation-100)] object-cover"
                  loading="lazy"
                  src={previewSrc}
                />
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--style-radius-s)] border border-[var(--theme-elevation-100)] bg-[var(--theme-elevation-50)]">
                  <ImageIcon size={16} />
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">
                  {media.filename || "Untitled image"}
                </div>
                <div className="truncate text-xs text-[var(--theme-text)] opacity-70">
                  alt: {altText}
                </div>
                {markdown ? (
                  <code className="mt-1 block truncate text-xs text-[var(--theme-text)] opacity-75">
                    {markdown}
                  </code>
                ) : (
                  <div className="mt-1 text-xs text-[var(--theme-text)] opacity-75">
                    File path unavailable
                  </div>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {markdown ? (
                  <Button
                    buttonStyle="pill"
                    className="shrink-0"
                    margin={false}
                    onClick={() => void copyMarkdown(markdown)}
                    size="small"
                    type="button"
                  >
                    <span className="flex items-center gap-2">
                      <Copy size={14} />
                      {copiedPath === markdown ? "Copied" : "Copy markdown"}
                    </span>
                  </Button>
                ) : null}

                <Button
                  buttonStyle="error"
                  disabled={deletingId === media.id}
                  margin={false}
                  onClick={() => void removeMedia(media.id)}
                  size="small"
                  type="button"
                >
                  <span className="flex items-center gap-2">
                    <Trash size={14} />
                    {deletingId === media.id ? "Deleting..." : "Delete"}
                  </span>
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
