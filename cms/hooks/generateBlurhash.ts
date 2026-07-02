import fs from "node:fs/promises";
import type { CollectionBeforeValidateHook } from "payload";
import { getPlaiceholder } from "plaiceholder";
import CustomAPIError from "../CustomAPIError";

export const generateBlurhash: CollectionBeforeValidateHook = async ({
  data,
  operation,
  req: { payload, file },
}) => {
  if (operation !== "create") return;

  try {
    payload.logger.info(`Generating blurhash for operation: ${operation}`);

    let buffer = file?.data;
    if ((!buffer || buffer.length === 0) && file?.tempFilePath) {
      buffer = await fs.readFile(file.tempFilePath);
    }

    if (!buffer || buffer.length === 0) {
      payload.logger.warn("No file buffer available for blurhash generation.");
      return;
    }

    const { base64 } = await getPlaiceholder(buffer, { size: 32 });
    payload.logger.info("Blurhash generated successfully.");

    return {
      ...data,
      blurhash: base64,
    };
  } catch (error) {
    payload.logger.error(`Error generating blurhash: ${error}`);
    throw new CustomAPIError("Failed to generate blur data url.");
  }
};
