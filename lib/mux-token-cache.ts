// client-side cache for Mux public tokens with automatic expiration

type CachedMuxToken = {
  token: string;
  expiresAt: number;
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
  constructor(message: string = "Too many requests. Please try again later.") {
    super(message, 429);
    this.name = "RateLimitError";
  }
}

const LOCAL_STORAGE_KEY = "mux_public_tokens";

function getPublicMuxToken(playbackId: string): string | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!raw) return null;

  const cache: Record<string, CachedMuxToken> = JSON.parse(raw);
  const cached = cache[playbackId];
  if (!cached) return null;

  if (Date.now() > cached.expiresAt) {
    delete cache[playbackId];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cache));
    return null;
  }

  return cached.token;
}

function setPublicMuxToken(
  playbackId: string,
  token: string,
  expiresMs: number,
) {
  if (typeof window === "undefined") return;

  const cache: Record<string, CachedMuxToken> = JSON.parse(
    localStorage.getItem(LOCAL_STORAGE_KEY) || "{}",
  );

  cache[playbackId] = {
    token,
    expiresAt: Date.now() + expiresMs,
  };

  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cache));
}

// fetch Mux token: use cache for free lessons, always fetch for paid
export async function fetchMuxToken(
  playbackId: string,
  isFree: boolean,
): Promise<string> {
  if (isFree) {
    const cached = getPublicMuxToken(playbackId);
    if (cached) return cached;
  }

  const res = await fetch("/api/mux/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ playbackId }),
  });

  if (res.status === 429) {
    const data = await res.json().catch(() => ({}));
    throw new RateLimitError(
      data.error || "Too many requests. Please try again later.",
    );
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new MuxTokenError(
      data.error || "Failed to fetch mux token",
      res.status,
    );
  }

  const { token } = await res.json();

  if (isFree) {
    const raw = process.env.NEXT_PUBLIC_MUX_PUBLIC_EXPIRATION_DAYS || "7d";
    const expiresMs = parseDuration(raw) - 5 * 60 * 1000; // -5 minutes
    setPublicMuxToken(playbackId, token, expiresMs);
  }

  return token;
}

function parseDuration(str: string): number {
  const match = str.match(/^(\d+)(s|m|h|d)$/);
  if (!match) throw new Error(`Invalid duration format: ${str}`);

  const value = Number(match[1]);
  const unit = match[2];

  switch (unit) {
    case "s":
      return value * 1000;
    case "m":
      return value * 60 * 1000;
    case "h":
      return value * 60 * 60 * 1000;
    case "d":
      return value * 24 * 60 * 60 * 1000;
    default:
      throw new Error(`Unknown unit: ${unit}`);
  }
}
