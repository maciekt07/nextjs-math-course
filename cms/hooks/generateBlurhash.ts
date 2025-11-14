import type { CollectionBeforeValidateHook } from "payload";
import { getPlaiceholder } from "plaiceholder";
import CustomAPIError from "../CustomAPIError";

export const generateBlurhash: CollectionBeforeValidateHook = async ({
  data,
  operation,
  req,
}) => {
  if (operation === "create" || operation === "update") {
    try {
      const buffer = req.file?.data;
      if (buffer) {
        const { base64 } = await getPlaiceholder(buffer, { size: 32 });
        return {
          ...data,
          blurhash: base64,
        };
      }
    } catch (error) {
      console.error(error);
      throw new CustomAPIError("Failed to generate blur data url.");
    }
  }
};
