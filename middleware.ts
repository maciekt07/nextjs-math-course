import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    const url = request.nextUrl.clone();

    const returnTo = request.nextUrl.pathname + request.nextUrl.search;

    url.pathname = "/auth/sign-in";
    url.searchParams.set("returnTo", returnTo);

    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/courses/:path*", "/account/:path*"],
};
