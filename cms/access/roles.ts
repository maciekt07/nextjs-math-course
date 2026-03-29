import type { TypedUser } from "payload";

export const isAdmin = (user: TypedUser | null): boolean =>
  user?.role === "admin";

const isEditor = (user: TypedUser | null): boolean => user?.role === "editor";

export const isAdminOrEditor = (user: TypedUser | null): boolean =>
  isAdmin(user) || isEditor(user);
