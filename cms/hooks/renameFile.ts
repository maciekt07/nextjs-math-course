import { randomUUID } from "node:crypto";
import path from "node:path";
import type { CollectionBeforeOperationHook } from "payload";
import CustomAPIError from "../CustomAPIError";

export const renameFile: CollectionBeforeOperationHook = async ({ args }) => {
  try {
    // protect original file name - rename to UUID
    if (args.operation === "create" && args.req.file) {
      const file = args.req.file;
      const ext = path.extname(file.name);
      file.name = `${randomUUID()}${ext}`;
    }
  } catch (error) {
    console.error(error);
    throw new CustomAPIError("Failed to rename file");
  }
};
