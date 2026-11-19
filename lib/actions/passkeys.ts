"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { passkeyNameSchema } from "@/lib/auth/auth-validation";

type PasskeyActionResult =
  | { success: true }
  | { success: false; error: string };

export async function deletePasskeyAction(
  id: string,
): Promise<PasskeyActionResult> {
  if (!id || typeof id !== "string") {
    return { success: false, error: "Missing passkey id" };
  }

  try {
    await auth.api.deletePasskey({
      body: { id },
      headers: await headers(),
    });
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete passkey" };
  }
}

export async function updatePasskeyAction(
  id: string,
  name: string,
): Promise<PasskeyActionResult> {
  if (!id || typeof id !== "string") {
    return { success: false, error: "Missing passkey id" };
  }

  const parsedName = passkeyNameSchema.safeParse(name);
  if (!parsedName.success) {
    return {
      success: false,
      error: parsedName.error.issues[0]?.message ?? "Invalid passkey name",
    };
  }

  try {
    await auth.api.updatePasskey({
      body: { id, name: parsedName.data },
      headers: await headers(),
    });
    return { success: true };
  } catch {
    return { success: false, error: "Failed to rename passkey" };
  }
}
