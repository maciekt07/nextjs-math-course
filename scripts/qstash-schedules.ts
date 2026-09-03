import { Client } from "@upstash/qstash";
import { clientEnv } from "@/env/client";
import { serverEnv } from "@/env/server";

const client = new Client({
  token: serverEnv.QSTASH_TOKEN,
  baseUrl: serverEnv.QSTASH_URL,
  retry: {
    retries: 3,
  },
});

const appUrl = clientEnv.NEXT_PUBLIC_APP_URL;
const cronDestination = `${appUrl}/api/cron/run`;

/**
 * creates a QStash schedule for the given destination if one does not already exist
 * @example
 * pnpm qstash:schedules:dev
 * pnpm qstash:schedules:prod
 */
async function upsertSchedule(
  destination: string,
  cron: string,
): Promise<string> {
  const existing = await client.schedules.list();
  const match = existing.find((s) => s.destination === destination);
  const envFile = process.execArgv
    .find((arg) => arg.startsWith("--env-file="))
    ?.split("=")[1];

  console.log(`using env file: ${envFile}`);

  if (match) {
    await client.schedules.delete(match.scheduleId);
    console.log(`Replaced existing schedule ${match.scheduleId}`);
  }

  const { scheduleId } = await client.schedules.create({
    destination,
    cron,
    retries: 2,
  });
  console.log(`Created schedule ${scheduleId} for ${destination}`);
  return scheduleId;
}

await upsertSchedule(cronDestination, "*/5 * * * *");
