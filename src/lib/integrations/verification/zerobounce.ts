import { IEmailVerifier, VerificationResult, NormalizedVerificationStatus } from "./types";

export class ZeroBounceVerifier implements IEmailVerifier {
  name = "zerobounce";
  private apiKey?: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.ZEROBOUNCE_API_KEY;
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
        provider: "zerobounce",
        isDeliverable: false,
        isDisposable: false,
        isAcceptAll: false,
        reason: "ZeroBounce API key not configured or unavailable",
        recommendation: "review",
        checkedAt,
      };
    }

    try {
      const url = `https://api.zerobounce.net/v2/validate?api_key=${this.apiKey}&email=${encodeURIComponent(cleanEmail)}&ip_address=`;
      const res = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      if (!res.ok) {
        if (res.status === 429) {
          return {
            email: cleanEmail,
            status: "VERIFICATION_UNAVAILABLE",
            provider: "zerobounce",
            isDeliverable: false,
            isDisposable: false,
            isAcceptAll: false,
            reason: "ZeroBounce rate limit or credit quota reached",
            recommendation: "review",
            checkedAt,
          };
        }
        throw new Error(`ZeroBounce API HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      const zbStatus: string = (data.status || "").toLowerCase();
      const subStatus: string = (data.sub_status || "").toLowerCase();

      let status: NormalizedVerificationStatus = "UNKNOWN";
      let recommendation: "send" | "review" | "block" = "review";
      let reason = `ZeroBounce status: ${zbStatus} (${subStatus || "no substatus"})`;
      let isDisposable = false;
      let isAcceptAll = false;

      switch (zbStatus) {
        case "valid":
          status = "VALID";
          recommendation = "send";
          reason = "Confirmed deliverable mailbox";
          break;
        case "invalid":
          status = "INVALID";
          recommendation = "block";
          reason = subStatus ? `Invalid address: ${subStatus}` : "Mailbox does not exist";
          break;
        case "catch-all":
        case "accept_all":
          status = "ACCEPT_ALL";
          isAcceptAll = true;
          recommendation = "review";
          reason = "Domain accepts all incoming mail; individual mailbox unconfirmed";
          break;
        case "spamtrap":
        case "abuse":
        case "do_not_mail":
          status = "RISKY";
          recommendation = "block";
          reason = `Elevated deliverability risk: ${zbStatus} (${subStatus})`;
          break;
        case "disposable":
          status = "DISPOSABLE";
          isDisposable = true;
          recommendation = "block";
          reason = "Disposable/temporary address detected";
          break;
        default:
          status = "UNKNOWN";
          recommendation = "review";
          reason = "Mailbox state could not be verified with confidence";
          break;
      }

      return {
        email: cleanEmail,
        status,
        provider: "zerobounce",
        score: status === "VALID" ? 95 : status === "ACCEPT_ALL" ? 60 : 20,
        isDeliverable: status === "VALID",
        isDisposable,
        isAcceptAll,
        reason,
        recommendation,
        checkedAt,
        rawDetails: {
          zeroBounceStatus: zbStatus,
          subStatus,
          domain: data.domain,
        },
      };
    } catch (err: any) {
      console.warn("ZeroBounce verification failed:", err?.message || err);
      return {
        email: cleanEmail,
        status: "VERIFICATION_UNAVAILABLE",
        provider: "zerobounce",
        isDeliverable: false,
        isDisposable: false,
        isAcceptAll: false,
        reason: `ZeroBounce error: ${err?.message || "network failure"}`,
        recommendation: "review",
        checkedAt,
      };
    }
  }
}
