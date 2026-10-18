import { Message } from "@/types";

export interface BounceEvent {
  recipientEmail: string;
  isHardBounce: boolean;
  bounceReason: string;
  gmailMessageId: string;
  bouncedAt: string;
}

export interface IGmailClient {
  isConfigured(): boolean;
  sendEmail(
    to: string,
    subject: string,
    body: string,
    threadId?: string
  ): Promise<{
    messageId: string;
    threadId: string;
    sentAt: string;
  }>;
  pollReplies(lastSyncedAt?: string): Promise<Message[]>;
  scanBounces(): Promise<BounceEvent[]>;
  getAuthUrl(state?: string, redirectUriOverride?: string): string;
}

export class RealGmailClient implements IGmailClient {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private tokens?: any;

  constructor(clientId: string, clientSecret: string, redirectUri: string, tokens?: any) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUri = redirectUri;
    this.tokens = tokens;
  }

  isConfigured(): boolean {
    return !!this.clientId && !!this.clientSecret && !!this.tokens;
  }

  getAuthUrl(state?: string, redirectUriOverride?: string): string {
    const scopes = [
      "https://www.googleapis.com/auth/gmail.send",
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/userinfo.email",
    ];
    const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
    const redirect = redirectUriOverride || this.redirectUri;
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: redirect,
      response_type: "code",
      scope: scopes.join(" "),
      access_type: "offline",
      prompt: "consent",
      ...(state ? { state } : {}),
    });
    return `${rootUrl}?${params.toString()}`;
  }

  async exchangeCodeForTokens(
    code: string,
    redirectUriOverride?: string
  ): Promise<{ tokens: any; email: string }> {
    const { google } = await import("googleapis");
    const redirect = redirectUriOverride || this.redirectUri;
    const oauth2Client = new google.auth.OAuth2(this.clientId, this.clientSecret, redirect);
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    let email = "";
    try {
      const gmail = google.gmail({ version: "v1", auth: oauth2Client });
      const profile = await gmail.users.getProfile({ userId: "me" });
      email = profile.data.emailAddress || "";
    } catch {
      try {
        const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
        const userInfo = await oauth2.userinfo.get();
        email = userInfo.data.email || "";
      } catch (err) {
        console.warn("Could not retrieve user email from Google profile:", err);
      }
    }

    return { tokens, email };
  }

  async sendEmail(to: string, subject: string, body: string, threadId?: string) {
    try {
      const { google } = await import("googleapis");
      const oauth2Client = new google.auth.OAuth2(this.clientId, this.clientSecret, this.redirectUri);
      oauth2Client.setCredentials(this.tokens);

      const gmail = google.gmail({ version: "v1", auth: oauth2Client });

      // Fetch user profile to get authentic sender email address for SPF/DMARC alignment
      let fromAddress = "";
      try {
        const profile = await gmail.users.getProfile({ userId: "me" });
        if (profile.data.emailAddress) {
          fromAddress = profile.data.emailAddress;
        }
      } catch (pErr) {
        console.warn("Could not retrieve user emailAddress for From header:", pErr);
      }

      // RFC 2047 compliant subject header encoding for non-ASCII characters
      const cleanSubject = (subject || "").trim();
      const encodedSubject = /[^\u0020-\u007E]/.test(cleanSubject)
        ? `=?UTF-8?B?${Buffer.from(cleanSubject, "utf-8").toString("base64")}?=`
        : cleanSubject;

      // RFC 5322 Message-ID domain
      const senderDomain = fromAddress && fromAddress.includes("@") ? fromAddress.split("@")[1] : "sponfy.dev";
      const messageId = `<${Date.now()}.${Math.random().toString(36).substring(2, 10)}@${senderDomain}>`;
      const dateHeader = new Date().toUTCString();

      // Ensure proper CRLF line endings throughout body (RFC 5321 SMTP forbids bare LF)
      const normalizedBody = (body || "").replace(/\r?\n/g, "\r\n");

      // Construct complete RFC 5322 MIME message with standard headers
      const headers = [
        fromAddress ? `From: ${fromAddress}` : null,
        `To: ${to.trim()}`,
        `Subject: ${encodedSubject}`,
        `Date: ${dateHeader}`,
        `Message-ID: ${messageId}`,
        `MIME-Version: 1.0`,
        `Content-Type: text/plain; charset=UTF-8`,
        `Content-Transfer-Encoding: 8bit`,
      ].filter(Boolean) as string[];

      const rawMessage = headers.join("\r\n") + "\r\n\r\n" + normalizedBody;

      const encodedMessage = Buffer.from(rawMessage, "utf-8")
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

      const res = await gmail.users.messages.send({
        userId: "me",
        requestBody: {
          raw: encodedMessage,
          threadId,
        },
      });

      return {
        messageId: res.data.id || `gmail-msg-${Date.now()}`,
        threadId: res.data.threadId || `thread-${Date.now()}`,
        sentAt: new Date().toISOString(),
      };
    } catch (err: any) {
      // Never pretend a real send succeeded: the caller must see the failure,
      // otherwise the tracker marks a sponsor "Contacted" when nothing was sent.
      console.error("Real Gmail API send failed:", err);
      throw new Error(`Gmail send failed: ${err?.message || err}`);
    }
  }

  async pollReplies(lastSyncedAt?: string): Promise<Message[]> {
    try {
      const { google } = await import("googleapis");
      const oauth2Client = new google.auth.OAuth2(this.clientId, this.clientSecret, this.redirectUri);
      oauth2Client.setCredentials(this.tokens);

      const gmail = google.gmail({ version: "v1", auth: oauth2Client });

      let userEmail = "";
      try {
        const profile = await gmail.users.getProfile({ userId: "me" });
        userEmail = profile.data.emailAddress?.toLowerCase() || "";
      } catch {
        // proceed if profile fetch fails
      }

      const listRes = await gmail.users.messages.list({
        userId: "me",
        q: "label:INBOX",
        maxResults: 25,
      });

      const messages: Message[] = [];
      const msgList = listRes.data.messages || [];

      for (const item of msgList.slice(0, 20)) {
        if (!item.id) continue;
        const msgDetail = await gmail.users.messages.get({
          userId: "me",
          id: item.id,
        });

        const headers = msgDetail.data.payload?.headers || [];
        const fromHeader = headers.find((h) => h.name?.toLowerCase() === "from")?.value || "";
        const toHeader = headers.find((h) => h.name?.toLowerCase() === "to")?.value || "";
        const subjectHeader = headers.find((h) => h.name?.toLowerCase() === "subject")?.value || "";
        const dateHeader = headers.find((h) => h.name?.toLowerCase() === "date")?.value;
        const snippet = msgDetail.data.snippet || "";

        const emailMatch = fromHeader.match(/<([^>]+)>/) || fromHeader.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        const cleanFromEmail = emailMatch ? (emailMatch[1] || emailMatch[0]).toLowerCase().trim() : fromHeader.toLowerCase().trim();

        // Skip messages sent by the user themselves
        if (userEmail && cleanFromEmail === userEmail) {
          continue;
        }

        // Helper to extract email body from payload
        const extractBody = (payload: any): string => {
          if (!payload) return "";
          if (payload.body?.data) {
            try {
              return Buffer.from(payload.body.data, "base64").toString("utf-8");
            } catch {
              return "";
            }
          }
          if (Array.isArray(payload.parts)) {
            // First check plain text
            for (const part of payload.parts) {
              if (part.mimeType === "text/plain" && part.body?.data) {
                try {
                  return Buffer.from(part.body.data, "base64").toString("utf-8");
                } catch {
                  // ignore
                }
              }
            }
            // Check nested parts
            for (const part of payload.parts) {
              if (part.parts) {
                const nested = extractBody(part);
                if (nested) return nested;
              }
            }
            // Fallback to HTML
            for (const part of payload.parts) {
              if (part.mimeType === "text/html" && part.body?.data) {
                try {
                  const html = Buffer.from(part.body.data, "base64").toString("utf-8");
                  return html
                    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
                    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
                    .replace(/<[^>]+>/g, " ")
                    .replace(/\s+/g, " ")
                    .trim();
                } catch {
                  // ignore
                }
              }
            }
          }
          return "";
        };

        const extractedBody = extractBody(msgDetail.data.payload);
        const resolvedBody = extractedBody?.trim() || snippet;

        let sentAtIso = new Date().toISOString();
        if (dateHeader) {
          try {
            const parsed = new Date(dateHeader);
            if (!isNaN(parsed.getTime())) sentAtIso = parsed.toISOString();
          } catch {
            // fallback
          }
        } else if (msgDetail.data.internalDate) {
          try {
            const parsed = new Date(Number(msgDetail.data.internalDate));
            if (!isNaN(parsed.getTime())) sentAtIso = parsed.toISOString();
          } catch {
            // fallback
          }
        }

        messages.push({
          id: `msg-${item.id}`,
          companyId: "",
          gmailMessageId: item.id,
          gmailThreadId: item.threadId || undefined,
          direction: "inbound",
          fromEmail: cleanFromEmail,
          toEmail: toHeader || "me",
          subject: subjectHeader,
          body: resolvedBody,
          sentAt: sentAtIso,
        });
      }

      return messages;
    } catch (err: any) {
      console.error("Real Gmail poll failed:", err);
      throw new Error(`Gmail reply sync failed: ${err?.message || err}`);
    }
  }

  async scanBounces(): Promise<BounceEvent[]> {
    try {
      const { google } = await import("googleapis");
      const oauth2Client = new google.auth.OAuth2(this.clientId, this.clientSecret, this.redirectUri);
      oauth2Client.setCredentials(this.tokens);

      const gmail = google.gmail({ version: "v1", auth: oauth2Client });
      // Query for Mail Delivery Subsystem / DSN messages
      const listRes = await gmail.users.messages.list({
        userId: "me",
        q: 'from:(mailer-daemon OR "Mail Delivery Subsystem" OR postmaster) "Delivery Status Notification"',
        maxResults: 15,
      });

      const bounces: BounceEvent[] = [];
      const msgList = listRes.data.messages || [];

      for (const item of msgList) {
        if (!item.id) continue;
        const msgDetail = await gmail.users.messages.get({
          userId: "me",
          id: item.id,
        });

        const snippet = msgDetail.data.snippet || "";
        const emailMatch = snippet.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        const bouncedRecipient = emailMatch ? emailMatch[0].toLowerCase() : "";

        if (bouncedRecipient) {
          // Discriminate between hard bounce (550 / User not found) vs soft temporary failure
          const isHard =
            /550|5\.1\.1|user not found|does not exist|mailbox unavailable|address rejected|recipient address rejected/i.test(
              snippet
            );

          bounces.push({
            recipientEmail: bouncedRecipient,
            isHardBounce: isHard,
            bounceReason: snippet.slice(0, 160),
            gmailMessageId: item.id,
            bouncedAt: new Date().toISOString(),
          });
        }
      }

      return bounces;
    } catch (err) {
      console.warn("Gmail bounce inspection failed:", err);
      return [];
    }
  }
}

export class MockGmailClient implements IGmailClient {
  isConfigured(): boolean {
    return false;
  }

  getAuthUrl(): string {
    return "/app/settings?demo_auth=success";
  }

  async sendEmail(to: string, subject: string, body: string, threadId?: string) {
    return {
      messageId: `mock-msg-${Date.now()}`,
      threadId: threadId || `mock-thread-${Date.now()}`,
      sentAt: new Date().toISOString(),
    };
  }

  async pollReplies(lastSyncedAt?: string): Promise<Message[]> {
    const { DEMO_MESSAGES } = await import("@/lib/data/seed-data");
    return DEMO_MESSAGES.filter((m) => m.direction === "inbound");
  }

  async scanBounces(): Promise<BounceEvent[]> {
    return [];
  }
}
