import type { MetadataRoute } from "next";
import { publishedStatusWhere } from "@/cms/access/contentAccess";
import { clientEnv } from "@/env/client";
import { getPayloadClient } from "@/lib/payload-client";

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

    lessonEntries.push({
      url: `${origin}/course/${courseSlug}/${lesson.slug}`,
      lastModified: lesson.updatedAt,
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

export const revalidate = false;
