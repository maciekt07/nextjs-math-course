import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { waitUntil } from "@vercel/functions";
import { NextResponse } from "next/server";
import { clientEnv } from "@/env/client";
import { serverEnv } from "@/env/server";
import { classificationQueue } from "@/lib/constants/queues";
import { notifyAdminsOfCronFailure } from "@/lib/monitoring/cron-failure";

export const runtime = "nodejs";

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
  const [publishing, classification] = await Promise.allSettled([
    callJob("/api/payload-jobs/run"),
    callJob(`/api/payload-jobs/run?queue=${classificationQueue}`),
  ]);

  if (publishing.status === "rejected") {
    waitUntil(
      notifyAdminsOfCronFailure(publishing.reason).catch(console.error),
    );
  }

  if (
    publishing.status === "rejected" ||
    classification.status === "rejected"
  ) {
    const errors = [publishing, classification].flatMap((r) =>
      r.status === "rejected" ? [String(r.reason)] : [],
    );
    console.error("Cron jobs failed:", errors);
    return NextResponse.json({ error: errors.join(" | ") }, { status: 502 });
  }

  return NextResponse.json({
    jobs: publishing.value,
    feedbackClassificationJobs: classification.value,
  });
}

export const POST = verifySignatureAppRouter(handler);
