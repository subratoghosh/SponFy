"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Users, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SponfyBrand } from "@/components/ui/SponfyBrand";

export default function OnboardingExecutivePlaceholderPage() {
  return (
    <div className="min-h-screen bg-butter-bg flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 text-green-dark selection:bg-butter-cream">
      <div className="w-full max-w-xl mb-6 flex items-center justify-between">
        <SponfyBrand href="/" size="md" theme="light" />
        <Link
          href="/onboarding"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-text-muted hover:text-green-dark transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Mode Selection
        </Link>
      </div>

      <div className="w-full max-w-xl bg-white rounded-3xl border border-green-dark/15 shadow-2xl p-8 sm:p-10 space-y-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center mx-auto">
          <Users className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-[11px] font-bold tracking-wider uppercase border border-blue-200">
            <Clock className="w-3.5 h-3.5" />
            Coming in Part 3
          </div>
          <h1 className="heading-font font-black text-2xl sm:text-3xl text-green-dark">
            Join Organisation Team
          </h1>
          <p className="text-xs sm:text-sm text-text-dim max-w-md mx-auto leading-relaxed">
            The executive request and approval workflow will be unlocked in Part 3. You will be able to search for existing organisations and campaigns, submit join requests, and execute assigned outreach queues.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-butter-panel/60 border border-green-dark/10 text-left space-y-2.5 text-xs text-green-dark/90">
          <div className="font-bold flex items-center gap-2 text-green-dark">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            What's included in Part 3:
          </div>
          <ul className="space-y-1.5 pl-6 list-disc text-text-dim text-[11px]">
            <li>Search organisation directory by name or slug</li>
            <li>Submit an AccessRequest with custom pitch & credentials</li>
            <li>Receive approval notification from campaign organisers</li>
            <li>Executive dashboard with scoped access to drafts & outreach</li>
          </ul>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/onboarding" className="w-full sm:w-auto">
            <Button variant="secondary" className="w-full text-xs font-bold">
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              Change Workspace Mode
            </Button>
          </Link>
          <Link href="/app" className="w-full sm:w-auto">
            <Button variant="green" className="w-full text-xs font-bold">
              Go to Individual Workspace
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
