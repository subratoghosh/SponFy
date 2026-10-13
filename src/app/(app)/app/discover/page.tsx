"use client";

import React, { useState, useEffect } from "react";
import { DiscoverPromptBox } from "@/components/discover/DiscoverPromptBox";
import { LiveJobProgress } from "@/components/discover/LiveJobProgress";
import { CandidateList } from "@/components/discover/CandidateList";
import { CandidateListSkeleton } from "@/components/skeletons/CandidateListSkeleton";
import { CSVImportModal } from "@/components/sponsors/CSVImportModal";
import { Company, Campaign } from "@/types";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Layers } from "lucide-react";

export default function DiscoverPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [jobActive, setJobActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [results, setResults] = useState<Company[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isExistingOnly, setIsExistingOnly] = useState(false);
  const [skippedCount, setSkippedCount] = useState(0);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");

  useEffect(() => {
    fetch("/api/campaigns")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setCampaigns(data.data);
          setSelectedCampaignId(data.data[0].id);
        }
      })
      .catch(() => {});
  }, []);

  const handleSearch = async (prompt: string, count: number) => {
    setLoading(true);
    setJobActive(true);
    setCurrentStep(0);
    setResults([]);
    setHasSearched(true);
    setIsExistingOnly(false);

    try {
      // Step simulation for live progress feel
      setTimeout(() => setCurrentStep(1), 600);
      setTimeout(() => setCurrentStep(2), 1200);
      setTimeout(() => setCurrentStep(3), 1800);

      const res = await fetch("/api/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          targetCount: count,
          campaignId: selectedCampaignId || undefined,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Discovery request failed with code ${res.status}`);
      }

      const data = await res.json();
      setTimeout(() => {
        setCurrentStep(4);
        const candidates = data.candidates || [];
        setResults(candidates);
        setJobActive(false);
        setLoading(false);
        const skipped = Array.isArray(data.skipped) ? data.skipped.length : 0;
        setSkippedCount(skipped);
        const addedCount = data.count ?? 0;
        const isExisting = addedCount === 0 && candidates.length > 0;
        setIsExistingOnly(isExisting);

        if (addedCount > 0) {
          toast(
            `Added ${addedCount} new sponsor(s)` +
              (skipped ? `, skipped ${skipped} already in the pipeline` : "") +
              ".",
            "success"
          );
        } else if (isExisting) {
          toast(
            `Showing ${candidates.length} matching sponsor(s) already in your pipeline.`,
            "info"
          );
        } else {
          toast(
            `No new companies found for this query. Try a broader search term.`,
            "info"
          );
        }
      }, 2400);
    } catch (err: any) {
      toast(err?.message || "Discovery search failed", "error");
      setLoading(false);
      setJobActive(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-green-dark">
            AI Sponsor Discovery Studio
          </h1>
          <p className="text-xs sm:text-sm text-text-dim mt-0.5">
            Hunt companies with active student programs, hackathon budgets, and tech synergy.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {campaigns.length > 1 && (
            <div className="flex items-center gap-1.5 bg-white border border-green-dark/15 rounded-xl px-2.5 py-1 text-xs text-green-dark">
              <Layers className="w-3.5 h-3.5 text-green-mid" />
              <select
                value={selectedCampaignId}
                onChange={(e) => setSelectedCampaignId(e.target.value)}
                className="bg-transparent font-semibold focus:outline-none cursor-pointer"
              >
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCsvModalOpen(true)}
            className="font-bold border-[#0C382E]/20 text-[#0C382E] hover:bg-[#FAF4E6] gap-1.5 shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#2D6A4F]" />
            Upload CSV Leads
          </Button>
        </div>
      </div>

      {/* 1. Prompt Search Box */}
      <DiscoverPromptBox onSearch={handleSearch} loading={loading} />

      {/* 2. Live Job Progress Stream */}
      <LiveJobProgress active={jobActive} step={currentStep} />

      {/* 3. Streamed Candidates List or Skeletons */}
      {loading ? (
        <CandidateListSkeleton />
      ) : (
        <CandidateList
          candidates={results}
          hasSearched={hasSearched}
          isExistingOnly={isExistingOnly}
          skippedCount={skippedCount}
        />
      )}

      {/* CSV Import Modal */}
      <CSVImportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        onSuccess={() => {
          toast("CSV companies loaded! Redirecting to pipeline...", "success");
          window.location.href = "/app/sponsors";
        }}
      />
    </div>
  );
}
