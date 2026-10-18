import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Explicitly allow public PWA assets and static routes
  if (
    pathname === "/manifest.webmanifest" ||
    pathname === "/sw.js" ||
    pathname === "/offline.html" ||
    pathname.startsWith("/icons/")
  ) {
    return NextResponse.next();
  }

  // In Demo Mode or development with no DB, allow immediate access to /app
  const isDemo =
    process.env.NEXT_PUBLIC_DEMO_MODE === "true" ||
    !process.env.DATABASE_URL ||
    process.env.DATABASE_URL.includes("placeholder");

  // Protect /app, /onboarding, and /admin
  if (pathname.startsWith("/app") || pathname.startsWith("/onboarding") || pathname.startsWith("/admin")) {
    const secrets = [
      process.env.AUTH_SECRET,
      process.env.NEXTAUTH_SECRET,
      "sponfy-dev-auth-secret-super-safe-fallback-32chars",
    ].filter((s, idx, arr): s is string => Boolean(s) && arr.indexOf(s) === idx);

    let token: any = null;
    try {
      token = await getToken({
        req: request,
        secret: secrets,
      });
      if (!token) {
        token = await getToken({
          req: request,
          secret: secrets,
          secureCookie: true,
          cookieName: "__Secure-authjs.session-token",
        });
      }
      if (!token) {
        token = await getToken({
          req: request,
          secret: secrets,
          secureCookie: true,
          cookieName: "__Secure-next-auth.session-token",
        });
      }
    } catch {
      // In edge or decrypt mismatch, token remains null
    }

    // If token exists but is flagged as invalid or points to a non-existent database user
    if (token?.invalid || token?.userNotFound || (token && !token.sub)) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("error", "SessionExpired");
      return NextResponse.redirect(loginUrl);
    }

    // Check for Auth.js session token cookie
    const sessionToken =
      request.cookies.get("authjs.session-token") ||
      request.cookies.get("__Secure-authjs.session-token") ||
      request.cookies.get("next-auth.session-token") ||
      request.cookies.get("__Secure-next-auth.session-token");

    // If a session cookie is present but cannot be decrypted, the cookie is invalid or expired
    if (!token && sessionToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("error", "SessionExpired");
      return NextResponse.redirect(loginUrl);
    }

    // In Demo Mode with no DB and no session, only allow /app and /onboarding without auth. Never /admin!
    if (!token && !sessionToken) {
      if (isDemo && !pathname.startsWith("/admin")) {
        return NextResponse.next();
      }

      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Signed-in user onboarding status check:
    // Skip onboarding restrictions for ADMIN.
    if (token && token.role !== "ADMIN") {
      const status = (token.onboardingStatus as string) || "NOT_STARTED";

      // If a COMPLETE user manually opens any /onboarding path, redirect to /app
      if (pathname.startsWith("/onboarding") && status === "COMPLETE") {
        return NextResponse.redirect(new URL("/app", request.url));
      }

      // If user is accessing /app/* and their onboardingStatus is not COMPLETE,
      // redirect them to their appropriate onboarding step.
      if (pathname.startsWith("/app") && status !== "COMPLETE") {
        const dest = status === "PENDING_APPROVAL" ? "/onboarding/pending" : "/onboarding";
        return NextResponse.redirect(new URL(dest, request.url));
      }

      // If user has PENDING_APPROVAL and visits /onboarding (or any step other than /onboarding/pending), send to /onboarding/pending
      if (pathname.startsWith("/onboarding") && pathname !== "/onboarding/pending" && status === "PENDING_APPROVAL") {
        return NextResponse.redirect(new URL("/onboarding/pending", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/onboarding/:path*", "/admin/:path*"],
};
