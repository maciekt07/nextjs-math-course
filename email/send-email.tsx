import "server-only";

import { waitUntil } from "@vercel/functions";
import type { JSX } from "react";
import { serverEnv } from "@/env/server";
import { resend } from "@/lib/resend";

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  react: JSX.Element;
}

export async function sendEmail({
  to,
  subject,
  react,
}: SendEmailOptions): Promise<void> {
  const isDev = process.env.NODE_ENV === "development";

  // ensure the email is sent on serverless
  waitUntil(
    resend.emails.send({
      from: `Maciej at Math Course Online <${serverEnv.RESEND_FROM_EMAIL}>`,
      to: isDev ? ["delivered@resend.dev"] : to,
      subject,
      react,
    }),
  );
}
