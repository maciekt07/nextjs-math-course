import "server-only";

import { readFile } from "node:fs/promises";
import type { Metadata } from "next";
import { clientEnv } from "@/env/client";

export const APP_NAME = "Math Course Online";
export const APP_SHORT_NAME = "Math Course";
export const SITE_DESCRIPTION =
  "Online math courses with guided lessons, quizzes, and video walkthroughs.";
export const SITE_LOCALE = "en_US";
export const SITE_CATEGORY = "education";
export const SEO_IMAGE_WIDTH = 1200;
export const SEO_IMAGE_HEIGHT = 630;

const LANDING_SOCIAL_IMAGE_PATH = "/og-image";

type PageTitleInput = {
  title?: string;
  absoluteTitle?: string;
};

type SeoImage = {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
};

type PublicMetadataInput = PageTitleInput & {
  description?: string | null;
  path?: string;
  images?: SeoImage[];
  type?: "website" | "article";
  robots?: Metadata["robots"];
};

type NoIndexMetadataInput = PageTitleInput & {
  description?: string | null;
};

const INDEXABLE_ROBOTS: Metadata["robots"] = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
};

export const NO_INDEX_ROBOTS: Metadata["robots"] = {
  index: false,
  follow: false,
  googleBot: {
    index: false,
    follow: false,
  },
};

function resolveTitle({ title, absoluteTitle }: PageTitleInput) {
  if (absoluteTitle) {
    return {
      metadataTitle: { absolute: absoluteTitle } satisfies Metadata["title"],
      socialTitle: absoluteTitle,
    };
  }

  if (title) {
    return {
      metadataTitle: title satisfies Metadata["title"],
      socialTitle: `${title} | ${APP_NAME}`,
    };
  }

  return {
    metadataTitle: undefined,
    socialTitle: APP_NAME,
  };
}

function resolveDescription(description?: string | null) {
  const normalized = description?.trim();
  return normalized || SITE_DESCRIPTION;
}

function resolveImageUrl(url: string) {
  try {
    return new URL(url).toString();
  } catch {
    return absoluteUrl(url);
  }
}

function resolveImages(images?: SeoImage[]) {
  return images?.map((image) => ({
    ...image,
    url: resolveImageUrl(image.url),
    width: image.width ?? SEO_IMAGE_WIDTH,
    height: image.height ?? SEO_IMAGE_HEIGHT,
  }));
}

function getDefaultSocialImages() {
  return resolveImages([getLandingSocialImage()]);
}

function getMetadataBase() {
  return new URL(clientEnv.NEXT_PUBLIC_APP_URL);
}

function absoluteUrl(path = "/") {
  return new URL(path, getMetadataBase()).toString();
}

export function buildSiteMetadata(): Metadata {
  const images = getDefaultSocialImages();

  return {
    metadataBase: getMetadataBase(),
    applicationName: APP_NAME,
    title: {
      template: `%s | ${APP_NAME}`,
      default: APP_NAME,
    },
    description: SITE_DESCRIPTION,
    authors: [{ name: "Maciej Twaróg", url: "https://github.com/maciekt07" }],
    robots: INDEXABLE_ROBOTS,
    verification: {
      google: "ckzSSA2XcguRbHoX5MuHbjvLoAVGRpmDg2ncejq_NWA",
    },
    appleWebApp: {
      capable: true,
      title: APP_SHORT_NAME,
      statusBarStyle: "default",
    },
    openGraph: {
      type: "website",
      siteName: APP_NAME,
      title: APP_NAME,
      description: SITE_DESCRIPTION,
      locale: SITE_LOCALE,
      url: absoluteUrl("/"),
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: APP_NAME,
      description: SITE_DESCRIPTION,
      images: images?.map((image) => image.url),
    },
  };
}

export function buildPublicMetadata({
  title,
  absoluteTitle,
  description,
  path = "/",
  images,
  type = "website",
  robots = INDEXABLE_ROBOTS,
}: PublicMetadataInput): Metadata {
  const resolvedTitle = resolveTitle({ title, absoluteTitle });
  const resolvedDescription = resolveDescription(description);
  const resolvedImages = resolveImages(images) ?? getDefaultSocialImages();
  const canonicalUrl = absoluteUrl(path);

  return {
    ...(resolvedTitle.metadataTitle
      ? { title: resolvedTitle.metadataTitle }
      : {}),
    description: resolvedDescription,
    category: SITE_CATEGORY,
    robots,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type,
      url: canonicalUrl,
      siteName: APP_NAME,
      locale: SITE_LOCALE,
      title: resolvedTitle.socialTitle,
      description: resolvedDescription,
      images: resolvedImages,
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle.socialTitle,
      description: resolvedDescription,
      images: resolvedImages?.map((image) => image.url),
    },
  };
}

export function buildNoIndexMetadata({
  title,
  absoluteTitle,
  description,
}: NoIndexMetadataInput): Metadata {
  const resolvedTitle = resolveTitle({ title, absoluteTitle });
  const resolvedDescription = resolveDescription(description);
  const resolvedImages = getDefaultSocialImages();

  return {
    ...(resolvedTitle.metadataTitle
      ? { title: resolvedTitle.metadataTitle }
      : {}),
    description: resolvedDescription,
    robots: NO_INDEX_ROBOTS,
    openGraph: {
      type: "website",
      siteName: APP_NAME,
      locale: SITE_LOCALE,
      title: resolvedTitle.socialTitle,
      description: resolvedDescription,
      images: resolvedImages,
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle.socialTitle,
      description: resolvedDescription,
      images: resolvedImages?.map((image) => image.url),
    },
  };
}

export function getCourseDescription(
  description?: string | null,
  courseTitle?: string | null,
) {
  return (
    description?.trim() ||
    (courseTitle ? `Explore ${courseTitle} on ${APP_NAME}.` : SITE_DESCRIPTION)
  );
}

export function getLandingSocialImage() {
  return {
    url: LANDING_SOCIAL_IMAGE_PATH,
    alt: `${APP_NAME} logo`,
    width: SEO_IMAGE_WIDTH,
    height: SEO_IMAGE_HEIGHT,
  } satisfies SeoImage;
}

export function getCourseSocialImage(courseSlug: string, alt?: string | null) {
  return {
    url: `/course/${courseSlug}/og-image`,
    alt: alt || `${courseSlug} course poster`,
    width: SEO_IMAGE_WIDTH,
    height: SEO_IMAGE_HEIGHT,
  } satisfies SeoImage;
}

export async function fileToDataUrl(fileUrl: URL, contentType: string) {
  const buffer = await readFile(fileUrl);
  return `data:${contentType};base64,${buffer.toString("base64")}`;
}

export async function imageUrlToDataUrl(url: string) {
  const response = await fetch(resolveImageUrl(url), {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "image/png";
  const buffer = Buffer.from(await response.arrayBuffer());

  return `data:${contentType};base64,${buffer.toString("base64")}`;
}
