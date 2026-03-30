import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import {
  isMobileUserAgent,
  JOBSCOUT_DESKTOP_COOKIE,
} from "@/lib/mobile-user-agent";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.url);
    return NextResponse.redirect(loginUrl);
  }

  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/mobile")) {
    return NextResponse.next();
  }

  if (request.cookies.get(JOBSCOUT_DESKTOP_COOKIE)?.value === "1") {
    return NextResponse.next();
  }

  if (!isMobileUserAgent(request.headers.get("user-agent"))) {
    return NextResponse.next();
  }

  const isMobileEntry =
    pathname === "/" ||
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/");

  if (isMobileEntry) {
    return NextResponse.redirect(new URL("/mobile", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard",
    "/dashboard/:path*",
    "/mobile/:path*",
    "/opportunities/:path*",
    "/applications/:path*",
    "/rejections/:path*",
    "/prompts",
    "/prompts/:path*",
    "/search-criteria",
    "/search-criteria/:path*",
    "/feeds/:path*",
    "/about",
    "/about/:path*",
    "/cv/:path*",
    "/settings",
    "/settings/:path*",
  ],
};
