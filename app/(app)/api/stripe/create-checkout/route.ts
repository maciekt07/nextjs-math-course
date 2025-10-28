import type { User } from "better-auth";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPayloadClient } from "@/lib/payload-client";
import { createPaymentIntent } from "@/lib/stripe/actions";
import type { Course } from "@/payload-types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { courseId } = body as { courseId?: string };

    if (!courseId)
      return NextResponse.json({ error: "Missing courseId" }, { status: 400 });

    const payload = await getPayloadClient();
    const course = await payload.findByID({
      id: courseId,
      collection: "courses",
    });
    if (!course)
      return NextResponse.json({ error: "Course not found" }, { status: 404 });

    // get session from request headers
    const session = await auth.api.getSession({
      headers: req.headers as unknown as Headers,
    });
    if (!session)
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const result = await createPaymentIntent(
      course as Course,
      session.user as User,
    );
    return NextResponse.json(result);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
