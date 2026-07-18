import type { TypedUser } from "payload";

export const isAdmin = (user: TypedUser | null): boolean =>
  user && "role" in user ? user.role === "admin" : false;

const isEditor = (user: TypedUser | null): boolean =>
  user && "role" in user ? user.role === "editor" : false;

export const isAdminOrEditor = (user: TypedUser | null): boolean =>
  isAdmin(user) || isEditor(user);
