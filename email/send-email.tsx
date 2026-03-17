import "server-only";

import type { JSX } from "react";

import { serverEnv } from "@/env/server";
import { resend } from "@/lib/resend";

const FROM_EMAIL = `Maciej at Math Course Online <${serverEnv.RESEND_FROM_EMAIL}>`;

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  react: JSX.Element;
}

export async function sendEmail({ to, subject, react }: SendEmailOptions) {
  const isDev = process.env.NODE_ENV === "development";

  await resend.emails.send({
    from: FROM_EMAIL,
    to: isDev ? ["delivered@resend.dev"] : to,
    subject,
    react,
  });
}
