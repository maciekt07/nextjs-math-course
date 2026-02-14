import { Courses } from "@cms/collections/Courses";
import { Feedbacks } from "@cms/collections/Feedbacks";
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
import { Chapters } from "@/cms/collections/Chapters";
import { Posters } from "@/cms/collections/Posters";
import { clientEnv } from "@/env/client";
import { serverEnv } from "@/env/server";

// Use ENABLE_S3=true in .env to enable S3/R2 storage
const useS3 = serverEnv.ENABLE_S3 && !!serverEnv.S3_BUCKET;

export default buildConfig({
  editor: lexicalEditor(),
  collections: [Courses, Posters, Lessons, Chapters, Media, Users, Feedbacks],
  secret: serverEnv.PAYLOAD_SECRET,
  db: mongooseAdapter({
    url: serverEnv.MONGO_URL,
  }),
  sharp,
  email: resendAdapter({
    defaultFromAddress: "hello@resend.dev",
    defaultFromName: "Math Course Online",
    apiKey: serverEnv.RESEND_API_KEY,
  }),
  plugins: [
    muxVideoPlugin({
      enabled: true,
      initSettings: {
        tokenId: serverEnv.MUX_TOKEN_ID,
        tokenSecret: serverEnv.MUX_TOKEN_SECRET,
        webhookSecret: serverEnv.MUX_WEBHOOK_SIGNING_SECRET,
        jwtSigningKey: serverEnv.MUX_JWT_KEY_ID,
        jwtPrivateKey: serverEnv.MUX_JWT_KEY,
      },
      uploadSettings: {
        cors_origin: clientEnv.NEXT_PUBLIC_APP_URL,
        new_asset_settings: {
          // ignore deprecation warning this works fine and the other thing doesn't
          playback_policy: ["signed", "public"],
        },
      },
    }),
    s3Storage({
      enabled: useS3,
      collections: {
        media: true,
        posters: true,
      },
      bucket: serverEnv.S3_BUCKET || "",
      config: {
        credentials: {
          accessKeyId: serverEnv.S3_ACCESS_KEY_ID || "",
          secretAccessKey: serverEnv.S3_SECRET || "",
        },
        region: "auto", // Cloudflare R2 uses 'auto' as the region
        endpoint: serverEnv.S3_ENDPOINT || "",
      },
    }),
  ],
});
