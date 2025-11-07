import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { resendAdapter } from "@payloadcms/email-resend";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import { buildConfig } from "payload";
import sharp from "sharp";
import { Courses } from "./collections/Courses";
import { Lessons } from "./collections/Lessons";
import { Media } from "./collections/Media";
import { Users } from "./collections/Users";

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
