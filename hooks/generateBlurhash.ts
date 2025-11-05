import { APIError, type CollectionBeforeValidateHook } from "payload";
import { getPlaiceholder } from "plaiceholder";

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
      throw new APIError("Failed to generate blur data url");
    }
  }
};
