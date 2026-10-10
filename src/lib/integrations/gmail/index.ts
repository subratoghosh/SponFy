import { Message } from "@/types";

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
  getAuthUrl(): string;
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

  getAuthUrl(): string {
    const scopes = [
      "https://www.googleapis.com/auth/gmail.send",
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/userinfo.email",
    ];
    const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: "code",
      scope: scopes.join(" "),
      access_type: "offline",
      prompt: "consent",
    });
    return `${rootUrl}?${params.toString()}`;
  }

  async sendEmail(to: string, subject: string, body: string, threadId?: string) {
    try {
      const { google } = await import("googleapis");
      const oauth2Client = new google.auth.OAuth2(this.clientId, this.clientSecret, this.redirectUri);
      oauth2Client.setCredentials(this.tokens);

      const gmail = google.gmail({ version: "v1", auth: oauth2Client });
      const rawMessage = [
        `To: ${to}`,
        `Subject: ${subject}`,
        `Content-Type: text/plain; charset=utf-8`,
        "",
        body,
      ].join("\n");

      const encodedMessage = Buffer.from(rawMessage)
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
      const listRes = await gmail.users.messages.list({
        userId: "me",
        q: "label:INBOX",
        maxResults: 10,
      });

      const messages: Message[] = [];
      const msgList = listRes.data.messages || [];

      for (const item of msgList.slice(0, 5)) {
        if (!item.id) continue;
        const msgDetail = await gmail.users.messages.get({
          userId: "me",
          id: item.id,
        });

        const headers = msgDetail.data.payload?.headers || [];
        const fromHeader = headers.find((h) => h.name?.toLowerCase() === "from")?.value || "";
        const subjectHeader = headers.find((h) => h.name?.toLowerCase() === "subject")?.value || "";
        const snippet = msgDetail.data.snippet || "";

        messages.push({
          id: `msg-${item.id}`,
          companyId: "",
          gmailMessageId: item.id,
          gmailThreadId: item.threadId || undefined,
          direction: "inbound",
          fromEmail: fromHeader,
          toEmail: "me",
          subject: subjectHeader,
          body: snippet,
          sentAt: new Date().toISOString(),
        });
      }

      return messages;
    } catch (err: any) {
      console.error("Real Gmail poll failed:", err);
      throw new Error(`Gmail reply sync failed: ${err?.message || err}`);
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
    return [];
  }
}
