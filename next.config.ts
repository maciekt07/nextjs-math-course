import path from "node:path";
import { fileURLToPath } from "node:url";
import { withPayload } from "@payloadcms/next/withPayload";
import { createJiti } from "jiti";
import type { NextConfig } from "next";

const __filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(__filename);

const jiti = createJiti(fileURLToPath(import.meta.url));

// import env files to validate during build
jiti.import("./env/server");
jiti.import("./env/client");

const nextConfig: NextConfig = {
  images: {
    minimumCacheTTL: 31536000, // 1 year
    qualities: [100, 75],

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
  turbopack: {
    root: path.resolve(dirname),
    ignoreIssue: [
      {
        path: /globals\.css$/,
        description: /search-text/,
      },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      ".cjs": [".cts", ".cjs"],
      ".js": [".ts", ".tsx", ".js", ".jsx"],
      ".mjs": [".mts", ".mjs"],
    };
    return webpackConfig;
  },
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
