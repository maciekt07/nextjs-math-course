import { spawnSync } from "node:child_process";
import { createSerwistRoute } from "@serwist/turbopack";
import { serverEnv } from "@/env/server";

function getGitSha(): string | undefined {
  const { stdout } = spawnSync("git", ["rev-parse", "HEAD"], {
    encoding: "utf-8",
  });
  return stdout?.trim() || undefined;
}

const revision =
  serverEnv.VERCEL_GIT_COMMIT_SHA || getGitSha() || crypto.randomUUID();

export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } =
  createSerwistRoute({
    additionalPrecacheEntries: [{ url: "/~offline", revision }],
    swSrc: "app/sw.ts",
    useNativeEsbuild: true,
  });
