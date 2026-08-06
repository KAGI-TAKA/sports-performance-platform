import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const PUBLIC_PATHS = ["/", "/login", "/register", "/forgot-password", "/reset-password"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_PATHS.includes(pathname) || pathname.startsWith("/api/auth");

  // Teruskan pathname lewat header, supaya Server Component (layout, dst.)
  // bisa tahu "request ini aslinya menuju ke mana" tanpa perlu prop drilling.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  if (isPublic) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};