import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { waitUntil } from "@vercel/functions";
import { NextResponse } from "next/server";
import { clientEnv } from "@/env/client";
import { serverEnv } from "@/env/server";
import { notifyAdminsOfCronFailure } from "@/lib/monitoring/cron-failure";

async function callJob(path: string) {
  const response = await fetch(`${clientEnv.NEXT_PUBLIC_APP_URL}${path}`, {
    headers: { Authorization: `Bearer ${serverEnv.CRON_SECRET}` },
    cache: "no-store",
    // signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`${path} failed with status ${response.status}: ${body}`);
  }

  return response.json();
}

async function handler() {
  try {
    const jobs = await callJob("/api/payload-jobs/run");
    return NextResponse.json({ jobs });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Cron job failed:", message);

    waitUntil(
      notifyAdminsOfCronFailure(err).catch((notificationError) => {
        console.error("Admin failure notification failed:", notificationError);
      }),
    );

    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export const POST = verifySignatureAppRouter(handler);
