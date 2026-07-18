import "server-only";

import { Courses } from "@cms/collections/Courses";
import { Feedbacks } from "@cms/collections/Feedbacks";
import { Lessons } from "@cms/collections/Lessons";
import { MediaPublic } from "@cms/collections/MediaPublic";
import { Users } from "@cms/collections/Users";
import { muxVideoPlugin } from "@oversightstudio/mux-video";
import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { resendAdapter } from "@payloadcms/email-resend";
import { importExportPlugin } from "@payloadcms/plugin-import-export";
import { mcpPlugin } from "@payloadcms/plugin-mcp";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import { buildConfig } from "payload";
import sharp from "sharp";
import { Chapters } from "@/cms/collections/Chapters";
import { MediaPrivate } from "@/cms/collections/MediaPrivate";
import { Posters } from "@/cms/collections/Posters";
import { clientEnv } from "@/env/client";
import { serverEnv } from "@/env/server";
import { LIMITS } from "@/lib/constants/limits";
import { APP_NAME } from "@/lib/constants/site";
import { buildPublicFileURL } from "@/lib/storage/build-url";
import PayloadMCPConfig from "@/payload-mcp";

// Use ENABLE_S3=true in .env to enable S3/R2 storage
const useS3 =
  serverEnv.ENABLE_S3 && !!serverEnv.S3_BUCKET && !!serverEnv.S3_PUBLIC_BUCKET;

function publicFileURL({
  filename,
  prefix,
}: {
  filename: string;
  prefix?: string;
}) {
  return buildPublicFileURL({
    bucket: serverEnv.S3_PUBLIC_BUCKET || "",
    cdnURL: serverEnv.S3_PUBLIC_CDN_URL || "",
    filename,
    prefix,
  });
}

export default buildConfig({
  editor: lexicalEditor(),
  collections: [
    Courses,
    Posters,
    Lessons,
    Chapters,
    MediaPrivate,
    MediaPublic,
    Users,
    Feedbacks,
  ],
  secret: serverEnv.PAYLOAD_SECRET,
  db: mongooseAdapter({
    url: serverEnv.MONGO_URL,
  }),
  sharp,
  graphQL: {
    disable: true,
  },
  typescript: {
    outputFile: "types/payload-types.ts",
  },

  admin: {
    meta: {
      titleSuffix: `- ${APP_NAME} Admin Panel`,
      icons: [
        {
          rel: "icon",
          type: "image/ico",
          url: "/favicon.ico",
        },
        {
          rel: "apple-touch-icon",
          type: "image/png",
          url: "/apple-icon.png",
        },
      ],
    },
    components: {
      graphics: {
        Icon: {
          path: "@cms/components/branding",
          exportName: "Icon",
        },
        Logo: {
          path: "@cms/components/branding",
          exportName: "Logo",
        },
      },
    },
  },

  email: resendAdapter({
    defaultFromAddress: serverEnv.RESEND_FROM_EMAIL,
    defaultFromName: serverEnv.RESEND_FROM_EMAIL,
    apiKey: serverEnv.RESEND_API_KEY,
  }),

  plugins: [
    mcpPlugin(PayloadMCPConfig),
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

    // https://payloadcms.com/docs/upload/storage-adapters#s3-r2
    s3Storage({
      enabled: useS3,
      collections: {
        "media-private": {
          signedDownloads: { expiresIn: LIMITS.media.signedDownloads },
        },
      },
      bucket: serverEnv.S3_BUCKET || "",
      config: {
        credentials: {
          accessKeyId: serverEnv.S3_ACCESS_KEY_ID || "",
          secretAccessKey: serverEnv.S3_SECRET || "",
        },
        region: "auto", // Cloudflare R2 uses 'auto' as the region
        endpoint: serverEnv.S3_ENDPOINT || "",
        forcePathStyle: true,
      },
    }),

    // public bucket
    s3Storage({
      enabled: useS3,
      collections: {
        posters: {
          disablePayloadAccessControl: true,
          generateFileURL: publicFileURL,
        },
        "media-public": {
          disablePayloadAccessControl: true,
          generateFileURL: publicFileURL,
        },
      },
      bucket: serverEnv.S3_PUBLIC_BUCKET || "",
      config: {
        credentials: {
          accessKeyId: serverEnv.S3_PUBLIC_ACCESS_KEY_ID || "",
          secretAccessKey: serverEnv.S3_PUBLIC_SECRET || "",
        },
        region: "auto",
        endpoint: serverEnv.S3_PUBLIC_ENDPOINT || "",
        forcePathStyle: true,
      },
    }),

    importExportPlugin({
      collections: [
        {
          slug: "feedback",
          import: false,
          export: {
            disableJobsQueue: true,
            format: "csv",
          },
        },
      ],
    }),
  ],
  //  onInit: async (payload) => {
  //   await Promise.all([
  //     payload.update({
  //       collection: "courses",
  //       data: {
  //         _status: "published",
  //       },
  //       limit: 0,
  //       overrideAccess: true,
  //       where: {
  //         _status: {
  //           exists: false,
  //         },
  //       },
  //     }),
  //     payload.update({
  //       collection: "lessons",
  //       data: {
  //         _status: "published",
  //       },
  //       limit: 0,
  //       overrideAccess: true,
  //       where: {
  //         _status: {
  //           exists: false,
  //         },
  //       },
  //     }),
  //   ]);
  // },
});
