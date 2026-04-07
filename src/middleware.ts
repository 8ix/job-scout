import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard",
    "/dashboard/:path*",
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
