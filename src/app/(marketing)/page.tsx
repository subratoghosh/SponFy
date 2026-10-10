import React from "react";
import { Hero } from "@/components/landing/Hero";
import { TrustStrip } from "@/components/landing/TrustStrip";
import { WorkflowStory } from "@/components/landing/WorkflowStory";
import { ShowcaseCarousel } from "@/components/landing/ShowcaseCarousel";
import { ApprovalPreview } from "@/components/landing/ApprovalPreview";
import { AnalyticsPreview } from "@/components/landing/AnalyticsPreview";
import { WhySponfy } from "@/components/landing/WhySponfy";
import { FAQ } from "@/components/landing/FAQ";
import { CTASection } from "@/components/landing/CTASection";

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* 1. Hero with Organic Blobs & Product Preview Overlap */}
      <Hero />

      {/* 2. Trust Strip */}
      <TrustStrip />

      {/* 3. 5-Step Workflow Storytelling */}
      <WorkflowStory />

      {/* 4. Sponsor Discovery & Cited Fit Score Showcase */}
      <ShowcaseCarousel />

      {/* 5. Outreach Approval Gate & Reply Intelligence View */}
      <ApprovalPreview />

      {/* 6. Analytics Preview */}
      <AnalyticsPreview />

      {/* 7. Why SponFy (4 Honest Differentiators) */}
      <WhySponfy />

      {/* 8. Frequently Asked Questions */}
      <FAQ />

      {/* 9. Final CTA Panel */}
      <CTASection />
    </div>
  );
}
