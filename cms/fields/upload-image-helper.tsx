"use client";

import { Button, useField } from "@payloadcms/ui";
import { Copy, ImageIcon, Trash } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { MediaPrivate, MediaPublic } from "@/types/payload-types";

type MediaCollection = "media-public" | "media-private";
type MediaDoc = MediaPrivate | MediaPublic;

type UploadValue =
  | MediaDoc
  | File
  | {
      id?: string;
      relationTo?: MediaCollection;
      value?: string | MediaDoc;
    }
  | string
  | null
  | undefined;

type UploadImageHelperProps = {
  path: string;
};

type MediaRef = {
  id: string;
  collection: MediaCollection;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isMediaDoc = (value: unknown): value is MediaDoc =>
  isRecord(value) && typeof value.id === "string";

// Polymorphic upload/relationship values from Payload come shaped as
// { relationTo: "media-public" | "media-private", value: string | Doc }.
// We need both the id AND the collection to know which API endpoint to hit.
const getItemRef = (item: UploadValue): MediaRef | null => {
  if (item instanceof File) return null;
  if (typeof item === "string") return null; // no collection info available

  if (isRecord(item)) {
    const collection = (item.relationTo ?? null) as MediaCollection | null;
    if (!collection) return null;

    if (typeof item.id === "string") {
      return { id: item.id, collection };
    }
    if (typeof item.value === "string") {
      return { id: item.value, collection };
    }
    if (isMediaDoc(item.value)) {
      return { id: item.value.id, collection };
    }
  }

  return null;
};

const getResolvedMedia = (
  item: UploadValue,
  mediaById: Record<string, MediaDoc>,
): MediaDoc | null => {
  if (isMediaDoc(item) && !(item instanceof File)) return item;
  if (isRecord(item) && isMediaDoc(item.value)) return item.value;

  const ref = getItemRef(item);
  return ref ? (mediaById[ref.id] ?? null) : null;
};

const buildMediaPath = (media: MediaDoc, collection: MediaCollection) => {
  if (collection === "media-public") {
    return media.url ?? null;
  }

  if (!media.filename) return null;
  return `/api/${collection}/file/${media.filename}`;
};

const getDefaultAlt = (media: MediaDoc) => {
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
  const [mediaById, setMediaById] = useState<Record<string, MediaDoc>>({});
  const [failedIds, setFailedIds] = useState<Set<string>>(new Set());

  const mediaItems = Array.isArray(value) ? value : [];

  const refsToFetch = useMemo(() => {
    return mediaItems
      .map((item) => {
        const media = getResolvedMedia(item, mediaById);
        if (media?.filename) return null;

        const ref = getItemRef(item);
        if (!ref) return null;
        if (failedIds.has(ref.id)) return null;

        return ref;
      })
      .filter((ref): ref is MediaRef => Boolean(ref));
  }, [mediaById, mediaItems, failedIds]);

  useEffect(() => {
    if (refsToFetch.length === 0) return;

    let isCancelled = false;

    const fetchMedia = async () => {
      const entries = await Promise.all(
        refsToFetch.map(async (ref) => {
          try {
            const response = await fetch(`/api/${ref.collection}/${ref.id}`, {
              credentials: "same-origin",
            });

            if (!response.ok) {
              return { ok: false as const, id: ref.id };
            }

            const doc = (await response.json()) as MediaDoc;
            return { ok: true as const, id: ref.id, doc };
          } catch (error) {
            console.error(`Failed to fetch media ${ref.id}`, error);
            return { ok: false as const, id: ref.id };
          }
        }),
      );

      if (isCancelled) return;

      const succeeded = entries.filter(
        (e): e is { ok: true; id: string; doc: MediaDoc } => e.ok,
      );
      const failed = entries.filter((e) => !e.ok);

      if (succeeded.length > 0) {
        setMediaById((current) => {
          const next = { ...current };
          for (const entry of succeeded) {
            next[entry.id] = entry.doc;
          }
          return next;
        });
      }

      if (failed.length > 0) {
        setFailedIds((current) => {
          const next = new Set(current);
          for (const entry of failed) {
            next.add(entry.id);
          }
          return next;
        });
      }
    };

    void fetchMedia();

    return () => {
      isCancelled = true;
    };
  }, [refsToFetch]);

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

  const removeMedia = async (mediaId: string, collection: MediaCollection) => {
    try {
      setDeletingId(mediaId);

      const response = await fetch(`/api/${collection}/${mediaId}`, {
        method: "DELETE",
        credentials: "same-origin",
      });

      if (!response.ok) {
        throw new Error(`Failed to delete media ${mediaId}`);
      }

      setValue(
        mediaItems.filter((item) => {
          const ref = getItemRef(item);
          return ref ? ref.id !== mediaId : true;
        }),
      );

      setMediaById((current) => {
        const next = { ...current };
        delete next[mediaId];
        return next;
      });

      setFailedIds((current) => {
        if (!current.has(mediaId)) return current;
        const next = new Set(current);
        next.delete(mediaId);
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
      <div className="mb-4 text-sm text-[13px]">Uploaded images</div>

      <div className="flex flex-col gap-2">
        {mediaItems.map((item, index) => {
          const media = getResolvedMedia(item, mediaById);
          const ref = getItemRef(item);

          if (!media) {
            const pendingName = item instanceof File ? item.name : null;
            const isFailed = ref ? failedIds.has(ref.id) : false;

            return (
              <div
                key={`${ref?.id ?? pendingName ?? "pending"}-${
                  // biome-ignore lint/suspicious/noArrayIndexKey: safe
                  index
                }`}
                className="rounded-[var(--style-radius-s)] border border-[var(--theme-elevation-150)] px-3 py-2 text-sm opacity-75"
              >
                {pendingName
                  ? `Uploading ${pendingName}...`
                  : isFailed
                    ? "Failed to load image details."
                    : "Loading image details..."}
              </div>
            );
          }

          const collection: MediaCollection =
            ref?.collection ?? "media-private";

          const mediaPath = buildMediaPath(media, collection);
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
                  alt: {altText} Â· {collection}
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
                  onClick={() => void removeMedia(media.id, collection)}
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
