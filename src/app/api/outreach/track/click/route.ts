import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const targetUrl = searchParams.get("url");
    const token = searchParams.get("t");

    if (!targetUrl) {
      return NextResponse.redirect(new URL("/app", req.url));
    }

    // Security check: only allow valid http / https target destinations
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(targetUrl);
      if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        return NextResponse.redirect(new URL("/app", req.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/app", req.url));
    }

    return NextResponse.redirect(parsedUrl.toString(), 302);
  } catch (err) {
    return NextResponse.redirect(new URL("/app", req.url));
  }
}
