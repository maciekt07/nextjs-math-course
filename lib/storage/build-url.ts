interface BuildPublicFileURLOptions {
  bucket: string;
  cdnURL: string;
  filename: string;
  prefix?: string;
}

/**
 * builds the CDN URL for a file stored in a public Cloudflare R2 bucket
 */
export function buildPublicFileURL({
  bucket,
  cdnURL,
  filename,
  prefix,
}: BuildPublicFileURLOptions) {
  if (!bucket) throw new Error("buildPublicFileURL: bucket is required");
  if (!cdnURL) throw new Error("buildPublicFileURL: cdnURL is required");
  if (!filename) throw new Error("buildPublicFileURL: filename is required");

  const cleanPrefix = prefix?.replace(/^\/+|\/+$/g, "");
  const key = [cleanPrefix, filename].filter(Boolean).join("/");

  return `${cdnURL.replace(/\/+$/, "")}/${bucket}/${key}`;
}
