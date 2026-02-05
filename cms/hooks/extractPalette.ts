import { Vibrant } from "node-vibrant/node";
import type { CollectionAfterChangeHook } from "payload";

export const extractPalette: CollectionAfterChangeHook = async ({
  doc,
  operation,
  req,
}) => {
  if (operation !== "create") return;

  try {
    const buffer = req.file?.data;

    if (!buffer) return;

    const palette = await Vibrant.from(buffer).quality(8).getPalette();

    await req.payload.update({
      collection: "posters",
      id: doc.id,
      data: {
        palette: {
          dominant: palette.Vibrant?.hex,
          vibrant: palette.LightVibrant?.hex,
          darkVibrant: palette.DarkVibrant?.hex,
          lightVibrant: palette.LightVibrant?.hex,
          muted: palette.Muted?.hex,
        },
      },
    });
  } catch (err) {
    req.payload.logger.warn(
      `Palette extraction failed for posters ${doc.id}: ${err}`,
    );
  }
};
