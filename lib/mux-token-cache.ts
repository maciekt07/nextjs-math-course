import { clientEnv } from "@/env/client";
import type { MuxTokens } from "@/types/mux";

// client-side cache for Mux signed tokens with automatic expiration

export class MuxTokenError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
  ) {
    super(message);
    this.name = "MuxTokenError";
  }
}

export class RateLimitError extends MuxTokenError {
  constructor(message = "Too many requests. Please try again later.") {
    super(message, 429);
  }
}

type CacheItem = {
  value: MuxTokens;
  expiresAt: number;
};

type CacheMap = Record<string, CacheItem>;

const CACHE_KEY = "mux_signed_tokens";
const STORAGE = typeof window !== "undefined" ? sessionStorage : null;
const CACHE_MARGIN = 10 * 1000; //10s

function readCache(): CacheMap {
  return STORAGE ? JSON.parse(STORAGE.getItem(CACHE_KEY) || "{}") : {};
}

function writeCache(cache: CacheMap) {
  STORAGE?.setItem(CACHE_KEY, JSON.stringify(cache));
}

function isExpired(item: CacheItem): boolean {
  return Date.now() > item.expiresAt;
}

function getCachedToken(playbackId: string): MuxTokens | null {
  const cache = readCache();
  const item = cache[playbackId];

  if (!item || isExpired(item)) {
    delete cache[playbackId];
    writeCache(cache);
    return null;
  }

  return item.value;
}

function setCachedToken(playbackId: string, tokens: MuxTokens, ttl: number) {
  const cache = readCache();

  cache[playbackId] = {
    value: tokens,
    expiresAt: Date.now() + ttl - CACHE_MARGIN,
  };

  writeCache(cache);
}

async function requestToken(playbackId: string): Promise<MuxTokens> {
  const res = await fetch("/api/mux/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ playbackId }),
  });

  if (res.status === 429) throw new RateLimitError();
  if (!res.ok) throw new MuxTokenError("Failed to fetch Mux token", res.status);

  return res.json();
}

function parseDuration(duration: string): number {
  const units = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  const match = duration.match(/^(\d+)(s|m|h|d)$/);

  if (!match) throw new Error(`Invalid duration format: ${duration}`);

  const [, value, unit] = match;
  return Number(value) * units[unit as keyof typeof units];
}

export async function fetchMuxToken(playbackId: string): Promise<MuxTokens> {
  if (!STORAGE) throw new MuxTokenError("fetchMuxToken must run on the client");

  const cached = getCachedToken(playbackId);
  if (cached) return cached;

  const tokens = await requestToken(playbackId);

  const ttl = parseDuration(clientEnv.NEXT_PUBLIC_MUX_SIGNED_URL_EXPIRATION);

  setCachedToken(playbackId, tokens, ttl);

  return tokens;
}
