import "server-only";

import CronFailureEmailTemplate from "@/email/templates/admin/cron-failure-template";
import { serverEnv } from "@/env/server";
import { APP_NAME } from "@/lib/constants/site";
import { getPayloadClient } from "@/lib/payload-client";
import { redis } from "@/lib/redis";
import { resend } from "@/lib/resend";

const BATCH_SIZE = 50;
const NOTIFICATION_COOLDOWN_SECONDS = 2 * 60 * 60;
const NOTIFICATION_KEY = "monitoring:scheduled-publish-failure-notified";

/**
 * notifies payload admins of a scheduled publishing (cron) failure via email with resend
 *
 * @param {unknown} error - the error object or message thrown during the cron job execution
 * @throws {Error}
 */
export async function notifyAdminsOfCronFailure(error: unknown): Promise<void> {
  const acquired = await redis.set(NOTIFICATION_KEY, "1", {
    nx: true,
    ex: NOTIFICATION_COOLDOWN_SECONDS,
  });
  if (acquired !== "OK") return;

  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "users",
    where: { role: { equals: "admin" } },
    select: { email: true },
    pagination: false,
    overrideAccess: true,
  });

  const recipients = [
    ...new Set(
      docs
        .map((user) => user.email?.trim().toLowerCase())
        .filter((email): email is string => !!email),
    ),
  ];
  if (!recipients.length) return;

  const message = error instanceof Error ? error.message : String(error);
  const timestamp = new Date().toISOString();
  const emails = recipients.map((to) => ({
    from: `${APP_NAME} <${serverEnv.RESEND_FROM_EMAIL}>`,
    to: process.env.NODE_ENV === "development" ? ["delivered@resend.dev"] : to,
    subject: "Scheduled publishing failed",
    react: CronFailureEmailTemplate({
      message,
      timestamp,
    }),
  }));

  const sendErrors: string[] = [];

  for (let index = 0; index < emails.length; index += BATCH_SIZE) {
    const batch = emails.slice(index, index + BATCH_SIZE);

    try {
      const result = await resend.batch.send(batch);

      if (result.error) {
        console.error("Cron notification batch error:", result.error);
        sendErrors.push(result.error.message);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error("Cron notification unexpected batch error:", err);
      sendErrors.push(errorMessage);
    }
  }

  if (sendErrors.length > 0) {
    throw new Error(
      `Failed to notify all admins. Encountered ${sendErrors.length} batch error(s): ${sendErrors.join(" | ")}`,
    );
  }
}
