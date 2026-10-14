import { describe, it, expect } from "vitest";
import { filterCandidateRelevance } from "@/lib/discovery/relevance";
import { normalizeName, normalizeDomain } from "@/lib/outreach/duplicates";
import { getVerificationService } from "@/lib/integrations/verification";
import { evaluateSend, resolveRecipient } from "@/lib/outreach/send-guard";
import { MockGmailClient } from "@/lib/integrations/gmail";

describe("Complete End-to-End Outreach Workflow Simulation", () => {
  it("executes the full pipeline: Discovery -> Relevance -> Verification -> Approval -> Eligibility Check -> Send", async () => {
    // -------------------------------------------------------------
    // STAGE 1: Discovery & Candidate Extraction
    // -------------------------------------------------------------
    const rawDiscoveryCandidates = [
      {
        name: "DevHub Cloud",
        website: "https://devhubcloud.io",
        industry: "Cloud & Developer Tools",
        description: "Cloud developer platform offering student credits and conference sponsorships.",
      },
      {
        name: "Campus Coding Club",
        website: "https://campuscode.edu.in",
        industry: "Education",
        description: "Student society organizing weekly coding sessions on campus.",
      },
    ];

    expect(rawDiscoveryCandidates.length).toBe(2);

    // -------------------------------------------------------------
    // STAGE 2: Fast Relevance Filtering
    // -------------------------------------------------------------
    const relevanceClassifications = await Promise.all(
      rawDiscoveryCandidates.map((c) =>
        filterCandidateRelevance(c, "Find developer tools and cloud sponsors", [
          "Cloud & Developer Tools",
        ])
      )
    );

    // Candidate 1 must be RELEVANT
    expect(relevanceClassifications[0].verdict).toBe("RELEVANT");
    // Candidate 2 (campus club) must be IRRELEVANT (avoid wasting credits!)
    expect(relevanceClassifications[1].verdict).toBe("IRRELEVANT");

    const approvedCandidate = rawDiscoveryCandidates[0];

    // -------------------------------------------------------------
    // STAGE 3: Contact Discovery & Verification
    // -------------------------------------------------------------
    const sponsorContact = {
      id: "cnt-test-1",
      name: "Alex Vance",
      role: "DevRel Lead",
      email: "alex@devhubcloud.io",
    };

    const verifier = getVerificationService();
    const verification = await verifier.verify(sponsorContact.email);

    // Email syntax is valid; verification returns structured result
    expect(verification.email).toBe("alex@devhubcloud.io");
    expect(["VALID", "ACCEPT_ALL", "UNKNOWN", "VERIFICATION_UNAVAILABLE"]).toContain(
      verification.status
    );

    // -------------------------------------------------------------
    // STAGE 4: Sponsor Approval (Transitions candidate into pipeline)
    // -------------------------------------------------------------
    const pipelineCompany = {
      id: "comp-sim-1",
      name: approvedCandidate.name,
      normalizedName: normalizeName(approvedCandidate.name),
      website: approvedCandidate.website,
      domain: normalizeDomain(approvedCandidate.website),
      stage: "Qualified",
      sponsorApproved: true,
      contacts: [sponsorContact],
    };

    expect(pipelineCompany.sponsorApproved).toBe(true);
    expect(pipelineCompany.stage).toBe("Qualified");

    // -------------------------------------------------------------
    // STAGE 5: Draft Generation
    // -------------------------------------------------------------
    const draft = {
      id: "draft-sim-1",
      companyId: pipelineCompany.id,
      contactId: sponsorContact.id,
      subject: "Partnership Opportunity with SponFy 2026",
      body: "Hi Alex,\n\nWe love what DevHub Cloud is doing for developers...",
      status: "approved" as const,
      needsAttention: false,
    };

    // -------------------------------------------------------------
    // STAGE 6: Pre-Send Eligibility Gate (Check Eligibility)
    // -------------------------------------------------------------
    const recipientRes = resolveRecipient({
      contactId: draft.contactId,
      contacts: pipelineCompany.contacts,
    });
    expect(recipientRes.ok).toBe(true);

    const isSuppressed = false;
    const priorOutbound: Array<{ sentAt: string }> = [];

    const eligibilityVerdict = evaluateSend({
      draftStatus: draft.status,
      recipient: (recipientRes as any).recipient,
      suppressed: isSuppressed,
      needsAttention: draft.needsAttention,
      priorOutbound,
      sentInWindow: 0,
      dailyLimit: 30,
      verificationStatus: verification.status,
    });

    // Check Eligibility must PASS
    expect(eligibilityVerdict.ok).toBe(true);

    // -------------------------------------------------------------
    // STAGE 7: Sending via Gmail Client & Atomic Claim
    // -------------------------------------------------------------
    const gmail = new MockGmailClient();
    const sendResult = await gmail.sendEmail(
      (recipientRes as any).recipient,
      draft.subject,
      draft.body
    );

    expect(sendResult.messageId).toBeDefined();
    expect(sendResult.threadId).toBeDefined();

    // -------------------------------------------------------------
    // STAGE 8: Post-Send State Update & Duplicate Protection
    // -------------------------------------------------------------
    const updatedPriorOutbound = [{ sentAt: sendResult.sentAt }];

    // Attempting to send immediately again to the same sponsor must be BLOCKED by too_soon guard
    const duplicateVerdict = evaluateSend({
      draftStatus: "approved",
      recipient: (recipientRes as any).recipient,
      suppressed: false,
      priorOutbound: updatedPriorOutbound,
      sentInWindow: 1,
      dailyLimit: 30,
    });

    expect(duplicateVerdict.ok).toBe(false);
    if (!duplicateVerdict.ok) {
      expect(duplicateVerdict.code).toBe("too_soon");
    }
  });
});
