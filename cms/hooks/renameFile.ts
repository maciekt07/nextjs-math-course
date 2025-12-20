import { randomUUID } from "node:crypto";
import path from "node:path";
import type { CollectionBeforeOperationHook } from "payload";
import CustomAPIError from "../CustomAPIError";

export const renameFile: CollectionBeforeOperationHook = async ({
  operation,
  req: { payload, file },
}) => {
  if (operation !== "create") return;

  try {
    if (!file) {
      payload.logger.warn("No file found to rename, skipping.");
      return;
    }

    const ext = path.extname(file.name);
    const oldName = file.name;
    file.name = `${randomUUID()}${ext}`;

    payload.logger.info(`File renamed from "${oldName}" to "${file.name}"`);
  } catch (error) {
    payload.logger.error("Error renaming file:", error);
    throw new CustomAPIError("Failed to rename file");
  }
};
