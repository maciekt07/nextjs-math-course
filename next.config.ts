import { fileURLToPath } from "node:url";
import { withPayload } from "@payloadcms/next/withPayload";
import { createJiti } from "jiti";
import type { NextConfig } from "next";

const jiti = createJiti(fileURLToPath(import.meta.url));

// import env files to validate during build
jiti.import("./env/server");
jiti.import("./env/client");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.mux.com",
        pathname: "/**",
      },
    ],
  },

  experimental: {
    reactCompiler: true,
    serverMinification: true,
    inlineCss: true,
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  // enable statically typed links
  // @see https://nextjs.org/docs/app/api-reference/config/typescript#statically-typed-links
  // typedRoutes: true,
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
