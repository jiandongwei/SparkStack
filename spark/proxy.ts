import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Add path prefixes to `protectedPaths` to protect additional routes.
 * Example: ["/dashboard", "/settings"]
 *
 * NOTE: `config.matcher` must be a static array so update the
 * `matcher` below whenever you add new entries here.
 */
const protectedPaths = ["/dashboard", "/settings", "/account"];

export function proxy(request: NextRequest) {
  const session = request.cookies.get("session")?.value ?? null;
  if (!session && protectedPaths.some((p) => request.nextUrl.pathname.startsWith(p))) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return undefined;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/settings/:path*",
    "/account/:path*",
  ],
};
