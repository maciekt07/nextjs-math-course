import type { MetadataRoute } from "next";
import { META_THEME_COLORS } from "@/hooks/use-meta-color";
import {
  APP_NAME,
  APP_SHORT_NAME,
  SITE_CATEGORY,
  SITE_DESCRIPTION,
  SITE_LOCALE,
} from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: APP_NAME,
    short_name: APP_SHORT_NAME,
    description: SITE_DESCRIPTION,
    lang: SITE_LOCALE,
    start_url: "/",
    scope: "/",
    display: "standalone",
    theme_color: META_THEME_COLORS.dark,
    background_color: META_THEME_COLORS.dark,
    categories: [SITE_CATEGORY],
    icons: [
      {
        src: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
