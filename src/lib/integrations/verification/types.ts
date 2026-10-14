/**
 * Unified Email Verification Types
 * Normalizes results across Hunter, ZeroBounce, and local cache.
 */

export type NormalizedVerificationStatus =
  | "VALID"
  | "INVALID"
  | "DISPOSABLE"
  | "ACCEPT_ALL"
  | "RISKY"
  | "UNKNOWN"
  | "PROVIDER_DISAGREEMENT"
  | "VERIFICATION_UNAVAILABLE";

export type VerificationProvider = "hunter" | "zerobounce" | "tiered" | "cache";

export interface VerificationResult {
  email: string;
  status: NormalizedVerificationStatus;
  provider: VerificationProvider;
  score?: number; // 0 - 100 confidence score
  isDeliverable: boolean;
  isDisposable: boolean;
  isAcceptAll: boolean;
  reason: string;
  recommendation: "send" | "review" | "block";
  checkedAt: string;
  rawDetails?: {
    hunterStatus?: string;
    zeroBounceStatus?: string;
    subStatus?: string;
    domain?: string;
  };
}

export interface IEmailVerifier {
  name: string;
  isConfigured(): boolean;
  verifyEmail(email: string): Promise<VerificationResult>;
}
