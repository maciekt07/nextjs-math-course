import { Courses } from "@cms/collections/Courses";
import { Lessons } from "@cms/collections/Lessons";
import { Media } from "@cms/collections/Media";
import { Users } from "@cms/collections/Users";
import { muxVideoPlugin } from "@oversightstudio/mux-video";
import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { resendAdapter } from "@payloadcms/email-resend";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import { buildConfig } from "payload";
import sharp from "sharp";

// Use ENABLE_S3=true in .env to enable S3/R2 storage
const useS3 = process.env.ENABLE_S3 === "true";

export default buildConfig({
  editor: lexicalEditor(),
  collections: [Courses, Lessons, Media, Users],
  secret: process.env.PAYLOAD_SECRET || "",
  db: mongooseAdapter({
    url: process.env.MONGO_URL || "",
  }),
  sharp,
  email: resendAdapter({
    defaultFromAddress: "hello@resend.dev",
    defaultFromName: "Math Course Online",
    apiKey: process.env.RESEND_API_KEY || "",
  }),
  plugins: [
    muxVideoPlugin({
      enabled: true,
      initSettings: {
        tokenId: process.env.MUX_TOKEN_ID || "",
        tokenSecret: process.env.MUX_TOKEN_SECRET || "",
        webhookSecret: process.env.MUX_WEBHOOK_SIGNING_SECRET || "",
        jwtSigningKey: process.env.MUX_JWT_KEY_ID || "",
        jwtPrivateKey: process.env.MUX_JWT_KEY || "",
      },
      uploadSettings: {
        cors_origin:
          process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000",
        new_asset_settings: {
          playback_policy: ["signed"],
        },
      },
    }),
    ...(useS3
      ? [
          s3Storage({
            collections: {
              media: true,
            },
            bucket: process.env.S3_BUCKET || "",
            config: {
              credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
                secretAccessKey: process.env.S3_SECRET || "",
              },
              region: "auto", // Cloudflare R2 uses 'auto' as the region
              endpoint: process.env.S3_ENDPOINT || "",
            },
          }),
        ]
      : []),
  ],
});
