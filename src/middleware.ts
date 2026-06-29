import { NextRequest, NextResponse } from "next/server";

// Paths that don't require authentication.
// /demo is intentionally public so the showcase URL stays accessible without login.
const PUBLIC_PATHS = ["/login", "/demo"];

const ADMIN_EMAIL = "admin@satellite.com";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /admin is its own auth domain — admins never have satellite_client_id, so
  // this check must run before the clientId guard below.
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");
  if (isAdmin) {
    const email = request.cookies.get("satellite_user_email")?.value;
    if (email !== ADMIN_EMAIL) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

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
