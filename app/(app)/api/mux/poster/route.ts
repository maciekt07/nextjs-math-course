import { type NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

const limiter = rateLimit({ max: 6, windowMs: 60_000 });

const ALLOWED_DOMAINS = new Set(["image.mux.com"]);

function isAllowedUrl(url: string) {
  try {
    return ALLOWED_DOMAINS.has(new URL(url).hostname);
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json(
      { error: "Missing url parameter" },
      { status: 400 },
    );
  }

  if (!isAllowedUrl(url)) {
    return NextResponse.json({ error: "Invalid URL domain" }, { status: 403 });
  }

  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const { allowed, retryAfter } = limiter(ip);

  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests, try again later" },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil((retryAfter ?? 1000) / 1000).toString(),
        },
      },
    );
  }

  try {
    const response = await fetch(url);

    if (!response.ok)
      return NextResponse.json(
        { error: "Failed to fetch poster" },
        { status: response.status },
      );

    return new NextResponse(response.body, {
      status: 200,
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    console.error("Error fetching Mux poster:", url, err);
    return NextResponse.json(
      { error: "Error fetching poster" },
      { status: 500 },
    );
  }
}
