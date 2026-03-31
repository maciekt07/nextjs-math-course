import { Vibrant } from "node-vibrant/node";
import type { CollectionBeforeValidateHook } from "payload";
import type { Poster } from "@/types/payload-types";

export const extractPalette: CollectionBeforeValidateHook<Poster> = async ({
  data,
  operation,
  req: { payload, file },
}) => {
  if (operation !== "create") return data;

  if (data?.palette?.dominant) {
    payload.logger.info("Palette already exists, skipping extraction");
    return data;
  }

  const mimeType = file?.mimetype;
  if (!mimeType?.startsWith("image/")) {
    return data;
  }

  const buffer = file?.data;
  if (!buffer || buffer.length === 0) return data;

  try {
    payload.logger.info(
      `Extracting color palette from ${file.name || "image"}...`,
    );

    const palette = await Vibrant.from(buffer).quality(10).getPalette();

    payload.logger.info("Palette extracted successfully");

    return {
      ...data,
      palette: {
        dominant: palette.Vibrant?.hex,
        vibrant: palette.LightVibrant?.hex,
        darkVibrant: palette.DarkVibrant?.hex,
        lightVibrant: palette.LightVibrant?.hex,
        muted: palette.Muted?.hex,
      },
    };
  } catch (error) {
    payload.logger.warn(
      `Palette extraction failed for poster: ${error instanceof Error ? error.message : error}`,
    );
    return data;
  }
};
