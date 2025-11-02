"use client";

import { Button } from "@payloadcms/ui";
import type React from "react";
import { useCallback, useState } from "react";

interface UploadedImage {
  id: string;
  filename: string;
  url: string;
  alt?: string;
}

export default function UploadWithUrl() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      setUploading(true);

      try {
        const uploadPromises = Array.from(files).map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);

          const response = await fetch("/api/media", {
            method: "POST",
            credentials: "include",
            body: formData,
          });

          if (!response.ok) {
            throw new Error(`Failed to upload ${file.name}`);
          }

          const data = await response.json();
          const imageUrl =
            data.doc.url || `api/media/file/${data.doc.filename}`;

          return {
            id: data.doc.id,
            filename: data.doc.filename,
            url: imageUrl.startsWith("/") ? imageUrl.substring(1) : imageUrl,
            alt: data.doc.alt || "",
          };
        });

        const uploadedImages = await Promise.all(uploadPromises);
        setImages((prev) => [...prev, ...uploadedImages]);
      } catch (error) {
        console.error("Upload error:", error);
        alert("Some images failed to upload. Please try again.");
      } finally {
        setUploading(false);
        e.target.value = "";
      }
    },
    [],
  );

  const copyMarkdown = useCallback((image: UploadedImage, index: number) => {
    const markdown = `![${image.alt || image.filename}](/${image.url})`;
    navigator.clipboard.writeText(markdown);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  }, []);

  const removeImage = useCallback(async (imageId: string) => {
    setDeleting(imageId);
    try {
      const response = await fetch(`/api/media/${imageId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to delete image");
      }

      setImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete image. Please try again.");
    } finally {
      setDeleting(null);
    }
  }, []);

  return (
    <div className="field-type">
      <div className="field-type__label">
        <label className="field-label">Upload Images for Markdown</label>
      </div>

      <div className="mb-4">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          disabled={uploading}
          className="file-input"
        />
        {uploading && (
          <div className="mt-2 text-sm opacity-70">Uploading images...</div>
        )}
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="flex gap-4 p-4 border border-base rounded-md bg-field-background"
            >
              <div
                className="w-32 h-32 flex-shrink-0 bg-cover bg-center rounded border border-base"
                style={{ backgroundImage: `url(/${image.url})` }}
              />

              <div className="flex-1 flex flex-col gap-2">
                <div className="text-sm font-medium">{image.filename}</div>

                <code className="text-xs p-2 rounded bg-code-background border border-base font-mono break-all">
                  ![{image.alt || image.filename}](/{image.url})
                </code>

                <div className="flex gap-2 mt-auto">
                  <Button
                    buttonStyle={
                      copiedIndex === index ? "primary" : "secondary"
                    }
                    size="small"
                    onClick={() => copyMarkdown(image, index)}
                    disabled={copiedIndex === index}
                  >
                    {copiedIndex === index ? "Copied" : "Copy Markdown"}
                  </Button>

                  <Button
                    buttonStyle="error"
                    size="small"
                    onClick={() => removeImage(image.id)}
                    disabled={deleting === image.id}
                  >
                    {deleting === image.id ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
