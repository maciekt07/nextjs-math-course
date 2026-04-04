import type { MetadataRoute } from "next";
import { publishedStatusWhere } from "@/cms/access/contentAccess";
import { clientEnv } from "@/env/client";
import { stripMarkdown } from "@/lib/markdown/strip-markdown";
import { getPayloadClient } from "@/lib/payload-client";
import type { Media, MuxVideo } from "@/types/payload-types";

type SitemapEntry = MetadataRoute.Sitemap[number];
type SitemapVideo = NonNullable<SitemapEntry["videos"]>[number];

function toAbsoluteUrl(origin: string, url?: string | null) {
  if (!url) {
    return null;
  }

  try {
    return new URL(url).toString();
  } catch {
    return new URL(url, origin).toString();
  }
}

function getImageUrls(
  origin: string,
  uploadImage?: (string | Media)[] | null,
): string[] | undefined {
  const images = (uploadImage ?? [])
    .map((image) =>
      typeof image === "string" ? null : toAbsoluteUrl(origin, image.url),
    )
    .filter((image): image is string => Boolean(image));

  return images.length > 0 ? Array.from(new Set(images)) : undefined;
}

function truncateDescription(text: string, max = 300): string {
  if (text.length <= max) return text;

  const trimmed = text.slice(0, max);

  const lastSpace = trimmed.lastIndexOf(" ");
  const safe = lastSpace > 0 ? trimmed.slice(0, lastSpace) : trimmed;

  return `${safe}...`;
}

function getVideoMetadata(
  origin: string,
  lesson: {
    free?: boolean | null;
    title: string;
    createdAt: string;
    videoDescription?: string | null;
    videoDurationSeconds?: number | null;
    video?: string | null | MuxVideo;
  },
): SitemapVideo[] | undefined {
  if (!lesson.video || typeof lesson.video === "string") {
    return undefined;
  }

  const playbackOption =
    lesson.video.playbackOptions?.find(
      (option) => option?.playbackPolicy === "public",
    ) ??
    lesson.video.playbackOptions?.find(
      (option) => option?.posterUrl || option?.playbackUrl,
    );

  const thumbnailLoc = toAbsoluteUrl(origin, playbackOption?.posterUrl);

  if (!thumbnailLoc) {
    return undefined;
  }

  return [
    {
      title: lesson.video.title ?? lesson.title,
      description: lesson.videoDescription
        ? truncateDescription(stripMarkdown(lesson.videoDescription))
        : lesson.title,
      thumbnail_loc: thumbnailLoc,
      content_loc:
        toAbsoluteUrl(origin, playbackOption?.playbackUrl) ?? undefined,
      duration:
        lesson.videoDurationSeconds ?? lesson.video.duration ?? undefined,
      publication_date: lesson.createdAt,
      requires_subscription: "no",
      family_friendly: "yes",
    },
  ];
}

// landing page and free lessons
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayloadClient();
  const siteUrl = new URL(clientEnv.NEXT_PUBLIC_APP_URL);
  const origin = siteUrl.origin;

  const { docs: lessons } = await payload.find({
    collection: "lessons",
    depth: 1,
    overrideAccess: true,
    pagination: false,
    where: {
      and: [publishedStatusWhere, { free: { equals: true } }],
    },
    select: {
      slug: true,
      course: true,
      type: true,
      title: true,
      uploadImage: true,
      video: true,
      videoDescription: true,
      videoDurationSeconds: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const lessonEntries: MetadataRoute.Sitemap = [];

  for (const lesson of lessons) {
    const courseSlug =
      typeof lesson.course === "string" ? null : lesson.course?.slug;

    if (!courseSlug || !lesson.slug) {
      continue;
    }

    const url = `${origin}/course/${courseSlug}/${lesson.slug}`;

    lessonEntries.push({
      url,
      lastModified: lesson.updatedAt,
      images:
        lesson.type === "text"
          ? getImageUrls(origin, lesson.uploadImage)
          : undefined,
      videos:
        lesson.type === "video" ? getVideoMetadata(origin, lesson) : undefined,
    });
  }

  return [
    {
      url: origin,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...lessonEntries.map((entry) => ({
      ...entry,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}

export const dynamic = "force-static";

export const revalidate = 604800; // 1 week
