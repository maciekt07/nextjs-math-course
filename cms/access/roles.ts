import type { PayloadRequest, TypedUser } from "payload";

export const isAdmin = (user: TypedUser | null): boolean =>
  user && "role" in user ? user.role === "admin" : false;

export const isEditor = (user: TypedUser | null): boolean =>
  user && "role" in user ? user.role === "editor" : false;

export const isAdminOrEditor = (user: TypedUser | null): boolean =>
  isAdmin(user) || isEditor(user);

export const isMcpRequest = (req: PayloadRequest): boolean =>
  req.payloadAPI === "MCP";
