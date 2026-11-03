import { spawnSync } from "node:child_process";
import { createSerwistRoute } from "@serwist/turbopack";

function getRevision() {
  const sha = spawnSync("git", ["rev-parse", "HEAD"], {
    encoding: "utf-8",
  }).stdout?.trim();

  return sha || crypto.randomUUID();
}

export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } =
  createSerwistRoute({
    additionalPrecacheEntries: [{ url: "/~offline", revision: getRevision() }],
    swSrc: "app/sw.ts",
    useNativeEsbuild: true,
  });
