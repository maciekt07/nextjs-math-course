import "server-only";

import { waitUntil } from "@vercel/functions";
import type { CreateEmailOptions } from "resend";
import { serverEnv } from "@/env/server";
import { APP_NAME } from "@/lib/constants/site";
import { resend } from "@/lib/resend";

export async function sendEmail(
  options: Omit<CreateEmailOptions, "from">,
): Promise<void> {
  const isDev = process.env.NODE_ENV === "development";

  // ensure the email is sent on serverless
  waitUntil(
    resend.emails.send({
      from: `Maciej at ${APP_NAME} <${serverEnv.RESEND_FROM_EMAIL}>`,
      ...options,
      to: isDev ? ["delivered@resend.dev"] : options.to,
    } as CreateEmailOptions),
  );
}
