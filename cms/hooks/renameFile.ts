import { randomUUID } from "node:crypto";
import path from "node:path";
import { APIError, type CollectionBeforeOperationHook } from "payload";

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
    throw new APIError("Failed to rename file");
  }
};
