import { IEmailVerifier, VerificationResult, NormalizedVerificationStatus } from "./types";

export class HunterVerifier implements IEmailVerifier {
  name = "hunter";
  private apiKey?: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.HUNTER_API_KEY;
  }

  isConfigured(): boolean {
    return !!(this.apiKey && this.apiKey.length > 5 && !this.apiKey.includes("your-"));
  }

  async verifyEmail(email: string): Promise<VerificationResult> {
    const checkedAt = new Date().toISOString();
    const cleanEmail = email.trim().toLowerCase();

    if (!this.isConfigured()) {
      return {
        email: cleanEmail,
        status: "VERIFICATION_UNAVAILABLE",
        provider: "hunter",
        isDeliverable: false,
        isDisposable: false,
        isAcceptAll: false,
        reason: "Hunter API key not configured or unavailable",
        recommendation: "review",
        checkedAt,
      };
    }

    try {
      const url = `https://api.hunter.io/v2/email-verifier?email=${encodeURIComponent(cleanEmail)}&api_key=${this.apiKey}`;
      const res = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      if (!res.ok) {
        if (res.status === 429) {
          return {
            email: cleanEmail,
            status: "VERIFICATION_UNAVAILABLE",
            provider: "hunter",
            isDeliverable: false,
            isDisposable: false,
            isAcceptAll: false,
            reason: "Hunter API rate limit or monthly credit quota reached",
            recommendation: "review",
            checkedAt,
          };
        }
        throw new Error(`Hunter API HTTP ${res.status}: ${res.statusText}`);
      }

      const json = await res.json();
      const data = json.data || {};
      const hunterStatus: string = data.status || "unknown";
      const score: number = typeof data.score === "number" ? data.score : 0;
      const isDisposable: boolean = !!data.disposable;
      const isAcceptAll: boolean = !!data.accept_all;

      let status: NormalizedVerificationStatus = "UNKNOWN";
      let recommendation: "send" | "review" | "block" = "review";
      let reason = `Hunter status: ${hunterStatus} (score: ${score}/100)`;

      if (isDisposable) {
        status = "DISPOSABLE";
        recommendation = "block";
        reason = "Temporary or disposable domain detected";
      } else if (hunterStatus === "valid") {
        status = "VALID";
        recommendation = "send";
        reason = "Confirmed deliverable mailbox";
      } else if (hunterStatus === "invalid") {
        status = "INVALID";
        recommendation = "block";
        reason = "Mailbox does not exist or domain rejects mail";
      } else if (hunterStatus === "accept_all" || isAcceptAll) {
        status = "ACCEPT_ALL";
        recommendation = "review";
        reason = "Domain accepts all incoming mail; specific mailbox existence is unconfirmed";
      } else if (hunterStatus === "risky") {
        status = "RISKY";
        recommendation = "review";
        reason = "High spam hazard or uncertain delivery reputation";
      } else {
        status = "UNKNOWN";
        recommendation = "review";
        reason = "Mailbox could not be determined with certainty";
      }

      return {
        email: cleanEmail,
        status,
        provider: "hunter",
        score,
        isDeliverable: status === "VALID",
        isDisposable,
        isAcceptAll,
        reason,
        recommendation,
        checkedAt,
        rawDetails: {
          hunterStatus,
          domain: data.domain,
        },
      };
    } catch (err: any) {
      console.warn("Hunter email verification failed:", err?.message || err);
      return {
        email: cleanEmail,
        status: "VERIFICATION_UNAVAILABLE",
        provider: "hunter",
        isDeliverable: false,
        isDisposable: false,
        isAcceptAll: false,
        reason: `Hunter verification error: ${err?.message || "network failure"}`,
        recommendation: "review",
        checkedAt,
      };
    }
  }
}
