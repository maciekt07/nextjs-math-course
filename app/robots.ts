import type { MetadataRoute } from "next";
import { clientEnv } from "@/env/client";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = new URL(clientEnv.NEXT_PUBLIC_APP_URL);
  const origin = siteUrl.origin;

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/account/", "/courses/"],
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}

export const dynamic = "force-static";

export const revalidate = false;
