/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { defaultCache } from "@serwist/turbopack/worker";
import {
  NetworkOnly,
  type PrecacheEntry,
  type RuntimeCaching,
  Serwist,
  type SerwistGlobalConfig,
} from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const PRIVATE_PATH_PREFIXES = [
  "/account",
  "/admin",
  "/api",
  "/auth",
  "/course",
  "/courses",
  "/payload",
] as const satisfies readonly string[];

// R2 uses AWS SigV4
const SIGNED_URL_PARAMS = [
  "X-Amz-Signature",
  "signature",
  "token",
] as const satisfies readonly string[];

const STREAM_HOSTS = ["stream.mux.com"] as const satisfies readonly string[];
const STREAM_PATH_PATTERN = /\.(?:m3u8|mpd|ts|m4s)$/i;

function isPrivatePath(pathname: string): boolean {
  return PRIVATE_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function isSignedOrStreamingUrl(url: URL): boolean {
  if (STREAM_HOSTS.some((host) => url.hostname === host)) return true;
  if (STREAM_PATH_PATTERN.test(url.pathname)) return true;
  return SIGNED_URL_PARAMS.some((param) => url.searchParams.has(param));
}

const runtimeCaching: RuntimeCaching[] = [
  {
    matcher: ({ sameOrigin, url }) => sameOrigin && isPrivatePath(url.pathname),
    handler: new NetworkOnly(),
  },
  {
    matcher: ({ url }) => isSignedOrStreamingUrl(url),
    handler: new NetworkOnly(),
  },
  ...defaultCache,
];

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: false,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching,
  fallbacks: {
    entries: [
      {
        url: "/~offline",
        matcher: ({ request }) => request.destination === "document",
      },
    ],
  },
});

serwist.addEventListeners();
