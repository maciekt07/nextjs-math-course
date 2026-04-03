import { fileURLToPath } from "node:url";
import { withPayload } from "@payloadcms/next/withPayload";
import { createJiti } from "jiti";
import type { NextConfig } from "next";

const jiti = createJiti(fileURLToPath(import.meta.url));

// import env files to validate during build
jiti.import("./env/server");
jiti.import("./env/client");

const nextConfig: NextConfig = {
  images: {
    minimumCacheTTL: 31536000, // 1 year
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.mux.com",
        pathname: "/**",
      },
    ],
  },

  reactStrictMode: true,
  reactCompiler: true,
  experimental: {
    serverMinification: true,
    authInterrupts: true,
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      ".cjs": [".cts", ".cjs"],
      ".js": [".ts", ".tsx", ".js", ".jsx"],
      ".mjs": [".mts", ".mjs"],
    };
    return webpackConfig;
  },

  // enable statically typed links
  // @see https://nextjs.org/docs/app/api-reference/config/typescript#statically-typed-links
  // typedRoutes: true,
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
