import "server-only";

import type { JSX } from "react";
import { Resend } from "resend";
import { serverEnv } from "@/env/server";

const resend = new Resend(serverEnv.RESEND_API_KEY);

interface SendEmailOptions {
  subject: string;
  react: JSX.Element;
}

export async function sendEmail({ subject, react }: SendEmailOptions) {
  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: ["delivered@resend.dev"],
    subject,
    react,
  });
}
