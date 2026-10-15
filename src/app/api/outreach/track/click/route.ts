import { NextResponse } from "next/server";
import { isSafeExternalUrl } from "@/lib/security/auth-guard";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const targetUrl = searchParams.get("url");

    if (!targetUrl) {
      return NextResponse.redirect(new URL("/app", req.url));
    }

    // SSRF & Open Redirect Security Protection:
    // Block loopback, AWS/GCP metadata endpoints (169.254.x.x), private subnets, and non-http schemes
    if (!isSafeExternalUrl(targetUrl)) {
      console.warn(`[Security Alert] Blocked unsafe redirect target: ${targetUrl}`);
      return NextResponse.redirect(new URL("/app", req.url));
    }

    return NextResponse.redirect(targetUrl, 302);
  } catch {
    return NextResponse.redirect(new URL("/app", req.url));
  }
}
