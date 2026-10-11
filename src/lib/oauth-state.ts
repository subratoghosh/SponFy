import "server-only";
import crypto from "crypto";

function getStateSecret(): Buffer {
  const secret =
    process.env.AUTH_SECRET ||
    process.env.TOKEN_ENCRYPTION_KEY ||
    "sponfy-dev-default-oauth-state-secret-32b";
  return crypto.createHash("sha256").update(String(secret)).digest();
}

/**
 * Creates an HMAC-SHA256 signed OAuth state parameter tied to a session's userId.
 * Format: base64url(payload).base64url(hmac)
 */
export function createSignedOAuthState(userId: string): string {
  const payload = JSON.stringify({
    userId,
    timestamp: Date.now(),
    nonce: crypto.randomBytes(16).toString("hex"),
  });
  const payloadB64 = Buffer.from(payload, "utf8").toString("base64url");
  const hmac = crypto
    .createHmac("sha256", getStateSecret())
    .update(payloadB64)
    .digest("base64url");
  return `${payloadB64}.${hmac}`;
}

export interface VerifyStateResult {
  valid: boolean;
  userId?: string;
  error?: string;
}

/**
 * Validates a signed OAuth state parameter, ensuring signature integrity,
 * matching session userId, and time-window validity (15 minutes max).
 */
export function verifySignedOAuthState(
  state: string | null | undefined,
  expectedUserId: string
): VerifyStateResult {
  if (!state || typeof state !== "string") {
    return { valid: false, error: "Missing state parameter" };
  }

  const parts = state.split(".");
  if (parts.length !== 2) {
    return { valid: false, error: "Invalid state structure" };
  }

  const [payloadB64, providedHmac] = parts;
  const expectedHmac = crypto
    .createHmac("sha256", getStateSecret())
    .update(payloadB64)
    .digest("base64url");

  // Constant-time HMAC comparison
  const providedHmacBuf = Buffer.from(providedHmac, "utf8");
  const expectedHmacBuf = Buffer.from(expectedHmac, "utf8");

  if (
    providedHmacBuf.length !== expectedHmacBuf.length ||
    !crypto.timingSafeEqual(providedHmacBuf, expectedHmacBuf)
  ) {
    return { valid: false, error: "Invalid state signature" };
  }

  try {
    const raw = Buffer.from(payloadB64, "base64url").toString("utf8");
    const parsed = JSON.parse(raw);

    if (!parsed.userId || typeof parsed.userId !== "string") {
      return { valid: false, error: "Malformed state payload" };
    }

    if (parsed.userId !== expectedUserId) {
      return { valid: false, error: "State userId does not match session" };
    }

    // Reject states older than 15 minutes (replay protection)
    const MAX_AGE_MS = 15 * 60 * 1000;
    if (Date.now() - parsed.timestamp > MAX_AGE_MS) {
      return { valid: false, error: "OAuth state expired" };
    }

    return { valid: true, userId: parsed.userId };
  } catch {
    return { valid: false, error: "Failed to parse state payload" };
  }
}
