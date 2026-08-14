import type { CollectionBeforeOperationHook } from "payload";
import { isMcpRequest } from "@/cms/access/roles";

/**
 * forces MCP updates to stay drafts
 * @see https://payloadcms.com/docs/plugins/mcp#hooks
 */
export const forceMcpDraftOnly: CollectionBeforeOperationHook = ({
  args,
  operation,
  req,
}) => {
  if (isMcpRequest(req) && (operation === "update" || operation === "create")) {
    args.draft = true;
  }
  return args;
};
