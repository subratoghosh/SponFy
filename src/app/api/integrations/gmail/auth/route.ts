import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getGmailClient } from "@/lib/integrations/factory";
import { RealGmailClient } from "@/lib/integrations/gmail";
import { createSignedOAuthState } from "@/lib/oauth-state";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", "/app/settings?tab=gmail");
    return NextResponse.redirect(url);
  }

  const client = getGmailClient();
  if (client instanceof RealGmailClient) {
    const signedState = createSignedOAuthState(session.user.id);
    const authUrl = client.getAuthUrl(signedState);
    return NextResponse.redirect(authUrl);
  }

  // If in demo mode or Google Client ID not yet supplied, simulate mock connection
  const settingsUrl = new URL("/app/settings", req.url);
  settingsUrl.searchParams.set("tab", "gmail");
  settingsUrl.searchParams.set("connected", "mock");
  return NextResponse.redirect(settingsUrl);
}
