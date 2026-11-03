import type { MetadataRoute } from "next";
import { META_THEME_COLORS } from "@/hooks/use-meta-color";
import {
  APP_NAME,
  APP_SHORT_NAME,
  SITE_CATEGORY,
  SITE_DESCRIPTION,
  SITE_LOCALE,
} from "@/lib/constants/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: APP_NAME,
    short_name: APP_SHORT_NAME,
    description: SITE_DESCRIPTION,
    lang: SITE_LOCALE,
    dir: "ltr",
    start_url: "/courses",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    theme_color: META_THEME_COLORS.dark,
    background_color: META_THEME_COLORS.dark,
    categories: [SITE_CATEGORY],
    prefer_related_applications: false,
    screenshots: [
      {
        src: "/pwa/narrow-screenshot-1.webp",
        type: "image/webp",
        sizes: "585x1266",
        form_factor: "narrow",
        label: "Course sidebar and lesson list in dark mode",
      },
      {
        src: "/pwa/narrow-screenshot-2.webp",
        type: "image/webp",
        sizes: "585x1266",
        form_factor: "narrow",
        label: "Course sidebar and lesson list in light mode",
      },
      {
        src: "/pwa/wide-screenshot-1.webp",
        type: "image/webp",
        sizes: "1510x860",
        form_factor: "wide",
        label: "Lesson with LaTeX content and callouts in dark mode",
      },
      {
        src: "/pwa/wide-screenshot-2.webp",
        type: "image/webp",
        sizes: "1510x860",
        form_factor: "wide",
        label: "Lesson with LaTeX content and callouts in light mode",
      },
    ],
    icons: [
      {
        src: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
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
    shortcuts: [
      {
        name: "My courses",
        short_name: "Courses",
        url: "/courses",
      },
      {
        name: "Account",
        short_name: "Account",
        url: "/account",
      },
    ],
  };
}
