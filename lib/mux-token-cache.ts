// client-side cache for Mux signed playback tokens with automatic expiration

type CachedMuxToken = {
  token: string;
  expiresAt: number;
};

const LOCAL_STORAGE_KEY = "mux_tokens";

function getLocalMuxToken(playbackId: string): string | null {
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

export async function fetchMuxToken(playbackId: string): Promise<string> {
  const cached = getLocalMuxToken(playbackId);
  if (cached) return cached;

  const res = await fetch("/api/mux/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ playbackId }),
  });

  if (!res.ok) throw new Error("Failed to fetch mux token");
  const data = await res.json();

  const expirationMs = 30 * 60 * 1000; // 30min
  const cache: Record<string, CachedMuxToken> = JSON.parse(
    localStorage.getItem(LOCAL_STORAGE_KEY) || "{}",
  );
  cache[playbackId] = {
    token: data.token,
    expiresAt: Date.now() + expirationMs - 60_000,
  };
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cache));

  return data.token;
}
