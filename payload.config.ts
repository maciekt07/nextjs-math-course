import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { buildConfig } from "payload";
import sharp from "sharp";
import { Courses } from "./collections/Courses";
import { Lessons } from "./collections/Lessons";

export default buildConfig({
  editor: lexicalEditor(),
  collections: [Courses, Lessons],
  secret: process.env.PAYLOAD_SECRET || "",
  db: mongooseAdapter({
    url: process.env.MONGO_URL || "",
  }),
  sharp,
});
