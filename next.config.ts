import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    reactCompiler: false,
  },
  images: {
    remotePatterns: [
      //TODO: only for testing purposes remove later
      { protocol: "https", hostname: "media.discordapp.net", pathname: "/**" },
    ],
  },
};

export default withPayload(nextConfig);
