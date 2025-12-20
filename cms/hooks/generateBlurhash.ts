import type { CollectionBeforeValidateHook } from "payload";
import { getPlaiceholder } from "plaiceholder";
import CustomAPIError from "../CustomAPIError";

export const generateBlurhash: CollectionBeforeValidateHook = async ({
  data,
  operation,
  req: { payload, file },
}) => {
  if (operation === "create" || operation === "update") {
    try {
      payload.logger.info(`Generating blurhash for operation: ${operation}`);
      const buffer = file?.data;
      if (buffer) {
        const { base64 } = await getPlaiceholder(buffer, { size: 32 });
        payload.logger.info("Blurhash generated successfully.");
        return {
          ...data,
          blurhash: base64,
        };
      }
    } catch (error) {
      payload.logger.error("Error generating blurhash:", error);
      throw new CustomAPIError("Failed to generate blur data url.");
    }
  }
};
