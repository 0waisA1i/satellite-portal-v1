import { NextRequest, NextResponse } from "next/server";

// Paths that don't require authentication.
// /demo is intentionally public so the showcase URL stays accessible without login.
const PUBLIC_PATHS = ["/login", "/demo"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
  const clientId = request.cookies.get("satellite_client_id")?.value;

  if (!clientId && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (clientId && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Skip Next.js internals and static files so they're never redirected.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
