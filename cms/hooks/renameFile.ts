import { randomUUID } from "node:crypto";
import path from "node:path";
import type { CollectionBeforeOperationHook } from "payload";
import CustomAPIError from "../CustomAPIError";

export const renameFile: CollectionBeforeOperationHook = async (req) => {
  try {
    if (req.operation !== "create") return;

    const file = req.req?.file;
    if (!file) return;

    const ext = path.extname(file.name);
    file.name = `${randomUUID()}${ext}`;
  } catch (error) {
    console.error(error);
    throw new CustomAPIError("Failed to rename file");
  }
};
