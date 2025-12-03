import { getPayload, type Payload } from "payload";
import { cache } from "react";
import config from "@/payload.config";

declare global {
  var payload:
    | {
        client: Payload | null;
        promise: Promise<Payload> | null;
      }
    | undefined;
}

// Initialize cached object on global
const cached = global.payload || { client: null, promise: null };

if (!global.payload) {
  global.payload = cached;
}

export const getPayloadClient = cache(async (): Promise<Payload> => {
  if (cached.client) return cached.client;

  if (!cached.promise) cached.promise = getPayload({ config });

  try {
    cached.client = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.client;
});
