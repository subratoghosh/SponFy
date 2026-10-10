import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // In Demo Mode or development with no DB, allow immediate access to /app
  const isDemo =
    process.env.NEXT_PUBLIC_DEMO_MODE === "true" ||
    !process.env.DATABASE_URL ||
    process.env.DATABASE_URL.includes("placeholder");

  // Protect /app and /onboarding
  if (pathname.startsWith("/app") || pathname.startsWith("/onboarding")) {
    if (isDemo) {
      return NextResponse.next();
    }

    // Check for Auth.js session token cookie
    const sessionToken =
      request.cookies.get("authjs.session-token") ||
      request.cookies.get("__Secure-authjs.session-token") ||
      request.cookies.get("next-auth.session-token") ||
      request.cookies.get("__Secure-next-auth.session-token");

    if (!sessionToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/onboarding/:path*"],
};
