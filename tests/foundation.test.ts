import { describe, it, expect } from "vitest";
import { encrypt, decrypt } from "@/lib/crypto";
import { SCORING_DIMENSIONS, getScoreTier, SCORE_TIERS } from "@/lib/config/scoring";
import { SYSTEM_LIMITS } from "@/lib/config/limits";
import { PIPELINE_STAGES } from "@/lib/config/stages";
import { mockRepositories } from "@/lib/data/mock";

describe("M1 Foundation Tests", () => {
  describe("AES-256-GCM Crypto", () => {
    it("performs successful encryption and decryption round-trip", () => {
      const sensitiveToken = "ya29.a0AfH6SMA-test-google-oauth-refresh-token-xyz123";
      const cipher = encrypt(sensitiveToken);
      expect(cipher).not.toBe(sensitiveToken);
      expect(cipher.split(":")).toHaveLength(3); // iv:tag:content

      const decrypted = decrypt(cipher);
      expect(decrypted).toBe(sensitiveToken);
    });

    it("generates a distinct IV for each encryption call of the same plaintext", () => {
      const plaintext = "refresh-token-constant-payload";
      const cipherA = encrypt(plaintext);
      const cipherB = encrypt(plaintext);
      expect(cipherA).not.toBe(cipherB);

      const ivA = cipherA.split(":")[0];
      const ivB = cipherB.split(":")[0];
      expect(ivA).not.toBe(ivB);
    });

    it("rejects or throws on tampered ciphertext", () => {
      const cipher = encrypt("secret-token-to-tamper");
      const [iv, tag, content] = cipher.split(":");
      const tamperedContent = content.slice(0, -2) + "ff";
      const tamperedCipher = `${iv}:${tag}:${tamperedContent}`;

      expect(() => decrypt(tamperedCipher)).toThrow();
    });
  });

  describe("Scoring Dimension Weights & Clamping", () => {
    it("has scoring dimension weights summing exactly to 100", () => {
      const totalWeight = SCORING_DIMENSIONS.reduce((sum, dim) => sum + dim.weight, 0);
      expect(totalWeight).toBe(100);
    });

    it("correctly identifies score tiers", () => {
      expect(getScoreTier(85).label).toBe(SCORE_TIERS.HIGH.label);
      expect(getScoreTier(62).label).toBe(SCORE_TIERS.MEDIUM.label);
      expect(getScoreTier(35).label).toBe(SCORE_TIERS.LOW.label);
    });
  });

  describe("System Limits & Stages Integrity", () => {
    it("has 12 canonical pipeline stages defined", () => {
      expect(PIPELINE_STAGES).toHaveLength(12);
      expect(PIPELINE_STAGES).toContain("DISCOVERED");
      expect(PIPELINE_STAGES).toContain("COMMITTED");
    });

    it("enforces safe default send cap and follow-up thresholds", () => {
      expect(SYSTEM_LIMITS.DEFAULT_DAILY_SEND_CAP).toBe(30);
      expect(SYSTEM_LIMITS.MAX_FOLLOWUP_COUNT).toBe(2);
      expect(SYSTEM_LIMITS.DEFAULT_FIRST_FOLLOWUP_DELAY_DAYS).toBe(2);
      expect(SYSTEM_LIMITS.DEFAULT_SECOND_FOLLOWUP_DELAY_DAYS).toBe(2);
    });
  });

  describe("In-Memory Mock Repositories (Demo Mode)", () => {
    it("provides seeded demo campaign and companies without database credentials", async () => {
      const campaigns = await mockRepositories.campaigns.list("demo-user");
      expect(campaigns.length).toBeGreaterThan(0);
      expect(campaigns[0].name).toContain("SponFy Hackathon");

      const companies = await mockRepositories.sponsors.list("demo-user");
      expect(companies.length).toBeGreaterThan(15);
    });

    it("supports creating and updating a sponsor company", async () => {
      const created = await mockRepositories.sponsors.create("demo-user", {
        campaignId: "camp-sponfy-2026",
        name: "Test Sponsor Corp",
        domain: "testsponsor.com",
        industry: "Developer Tools",
        fitScore: 88,
      });

      expect(created.name).toBe("Test Sponsor Corp");
      expect(created.stage).toBe("DISCOVERED");

      const updated = await mockRepositories.sponsors.updateStage("demo-user", created.id, "QUALIFIED");
      expect(updated.stage).toBe("QUALIFIED");
    });
  });
});
