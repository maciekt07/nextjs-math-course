import { ImageResponse } from "next/og";
import { getCourseSeoData } from "@/lib/data/seo";
import {
  APP_NAME,
  fileToDataUrl,
  imageUrlToDataUrl,
  SEO_IMAGE_HEIGHT,
  SEO_IMAGE_WIDTH,
} from "@/lib/seo";

export const runtime = "nodejs";

export const revalidate = 2592000; // 30 days

async function getFallbackLogo() {
  return fileToDataUrl(
    new URL("../../../../../public/logo512.png", import.meta.url),
    "image/png",
  );
}

export async function GET(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{ courseName: string }>;
  },
) {
  const { courseName } = await params;
  const course = await getCourseSeoData(courseName);

  const imageDataUrl = course?.posterUrl
    ? await imageUrlToDataUrl(course.posterUrl).catch(getFallbackLogo)
    : await getFallbackLogo();

  const shouldCrop = Boolean(course?.posterUrl);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        background: "#ffffff",
      }}
    >
      {/* biome-ignore lint/performance/noImgElement: ImageResponse requires plain img elements. */}
      <img
        alt={course?.posterAlt || `${APP_NAME} course poster`}
        src={imageDataUrl}
        width={SEO_IMAGE_WIDTH}
        height={SEO_IMAGE_HEIGHT}
        style={{
          width: "100%",
          height: "100%",
          objectFit: shouldCrop ? "cover" : "contain",
        }}
      />
    </div>,
    {
      width: SEO_IMAGE_WIDTH,
      height: SEO_IMAGE_HEIGHT,
    },
  );
}
