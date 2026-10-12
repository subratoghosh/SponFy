import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getGmailClient } from "@/lib/integrations/factory";
import { RealGmailClient } from "@/lib/integrations/gmail";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { encrypt } from "@/lib/crypto";
import { updateGmailStatus } from "@/lib/data/repositories/settings";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const stateUserId = url.searchParams.get("state");

  const settingsUrl = new URL("/app/settings", req.url);
  settingsUrl.searchParams.set("tab", "gmail");

  if (error) {
    settingsUrl.searchParams.set("error", error);
    return NextResponse.redirect(settingsUrl);
  }

  if (!code) {
    settingsUrl.searchParams.set("error", "missing_code");
    return NextResponse.redirect(settingsUrl);
  }

  try {
    const session = await auth();
    const userId = session?.user?.id || stateUserId;

    if (!userId) {
      settingsUrl.searchParams.set("error", "unauthenticated");
      return NextResponse.redirect(settingsUrl);
    }

    const client = getGmailClient();
    if (client instanceof RealGmailClient) {
      const { tokens, email } = await client.exchangeCodeForTokens(code);

      const userEmail = email || session?.user?.email || "connected@gmail.com";
      const refreshToken = tokens.refresh_token || "";
      const accessToken = tokens.access_token || "";

      if (isDatabaseConfigured()) {
        const expiresAt = tokens.expiry_date
          ? new Date(tokens.expiry_date)
          : new Date(Date.now() + 3600 * 1000);

        await (prisma as any).gmailAccount.upsert({
          where: { userId },
          create: {
            userId,
            email: userEmail,
            refreshTokenEnc: refreshToken ? encrypt(refreshToken) : encrypt("access-only-token"),
            accessTokenEnc: accessToken ? encrypt(accessToken) : null,
            expiresAt,
            scopes: tokens.scope || "gmail.send gmail.readonly",
            status: "ACTIVE",
            lastSyncAt: new Date(),
          },
          update: {
            email: userEmail,
            refreshTokenEnc: refreshToken ? encrypt(refreshToken) : undefined,
            accessTokenEnc: accessToken ? encrypt(accessToken) : null,
            expiresAt,
            status: "ACTIVE",
            lastSyncAt: new Date(),
          },
        });
      }

      await updateGmailStatus({
        connected: true,
        email: userEmail,
        isMock: false,
        lastSyncAt: new Date().toISOString(),
      });

      settingsUrl.searchParams.set("connected", "success");
      return NextResponse.redirect(settingsUrl);
    }

    // Mock fallback
    await updateGmailStatus({
      connected: true,
      email: "demo.organizer@gmail.com",
      isMock: true,
    });
    settingsUrl.searchParams.set("connected", "mock");
    return NextResponse.redirect(settingsUrl);
  } catch (err: any) {
    console.error("Gmail OAuth callback exchange failed:", err);
    settingsUrl.searchParams.set("error", "token_exchange_failed");
    return NextResponse.redirect(settingsUrl);
  }
}
