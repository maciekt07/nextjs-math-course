import { clientEnv } from "@/env/client";

// client-side cache for Mux public and signed tokens with automatic expiration

type CacheItem = {
  value: string;
  expiresAt: number;
};

type CacheMap = Record<string, CacheItem>;

type TokenKind = "public" | "signed";

type TokenConfig = {
  cacheKey: `mux_${TokenKind}_tokens`;
  storage: Storage | null;
  expirationEnv: string;
  cacheMargin: number;
};

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

const TOKEN_CONFIGS = {
  public: {
    cacheKey: "mux_public_tokens",
    storage: typeof window !== "undefined" ? localStorage : null,
    expirationEnv: clientEnv.NEXT_PUBLIC_MUX_PUBLIC_EXPIRATION,
    cacheMargin: 5 * 60 * 1000, // 5 minutes
  },
  signed: {
    cacheKey: "mux_signed_tokens",
    storage: typeof window !== "undefined" ? sessionStorage : null,
    expirationEnv: clientEnv.NEXT_PUBLIC_MUX_SIGNED_URL_EXPIRATION,
    cacheMargin: 10 * 1000, // 10 seconds
  },
} as const satisfies Record<TokenKind, TokenConfig>;

function readCache(storage: Storage, cacheKey: string): CacheMap {
  return JSON.parse(storage.getItem(cacheKey) || "{}");
}

function writeCache(storage: Storage, cacheKey: string, cache: CacheMap): void {
  storage.setItem(cacheKey, JSON.stringify(cache));
}

function isExpired(item: CacheItem): boolean {
  return Date.now() > item.expiresAt;
}

function getCachedToken(
  storage: Storage | null,
  cacheKey: string,
  playbackId: string,
): string | null {
  if (!storage) return null;
  const cache = readCache(storage, cacheKey);
  const item = cache[playbackId];

  if (!item || isExpired(item)) {
    delete cache[playbackId];
    writeCache(storage, cacheKey, cache);
    return null;
  }

  return item.value;
}

function setCachedToken(
  storage: Storage | null,
  cacheKey: string,
  playbackId: string,
  token: string,
  ttl: number,
  margin: number,
): void {
  if (!storage) return;
  const cache = readCache(storage, cacheKey);
  cache[playbackId] = {
    value: token,
    expiresAt: Date.now() + ttl - margin,
  };
  writeCache(storage, cacheKey, cache);
}

async function requestToken(
  playbackId: string,
  signed: boolean,
): Promise<string> {
  const response = await fetch("/api/mux/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ playbackId, signed }),
  });

  if (response.status === 429) {
    throw new RateLimitError();
  }

  if (!response.ok) {
    throw new MuxTokenError("Failed to fetch mux token", response.status);
  }

  const { token } = await response.json();
  return token;
}

function getTokenConfig(isFree: boolean): TokenConfig {
  const config = isFree ? TOKEN_CONFIGS.public : TOKEN_CONFIGS.signed;

  if (!config.storage) {
    throw new MuxTokenError("fetchMuxToken must run on the client");
  }

  return config as TokenConfig;
}

export async function fetchMuxToken(
  playbackId: string,
  isFree: boolean,
): Promise<string> {
  const config = getTokenConfig(isFree);

  const cachedToken = getCachedToken(
    config.storage,
    config.cacheKey,
    playbackId,
  );
  if (cachedToken) {
    return cachedToken;
  }

  const token = await requestToken(playbackId, !isFree);
  const ttl = parseDuration(config.expirationEnv);

  setCachedToken(
    config.storage,
    config.cacheKey,
    playbackId,
    token,
    ttl,
    config.cacheMargin,
  );

  return token;
}

const TIME_UNITS = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
} as const;

function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)(s|m|h|d)$/);
  if (!match) {
    throw new Error(`Invalid duration format: ${duration}`);
  }

  const [, value, unit] = match;
  const multiplier = TIME_UNITS[unit as keyof typeof TIME_UNITS];

  if (!multiplier) {
    throw new Error(`Unknown time unit: ${unit}`);
  }

  return Number(value) * multiplier;
}
