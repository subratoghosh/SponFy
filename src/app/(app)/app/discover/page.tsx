"use client";

import React, { useState } from "react";
import { DiscoverPromptBox } from "@/components/discover/DiscoverPromptBox";
import { LiveJobProgress } from "@/components/discover/LiveJobProgress";
import { CandidateList } from "@/components/discover/CandidateList";
import { CandidateListSkeleton } from "@/components/skeletons/CandidateListSkeleton";
import { CSVImportModal } from "@/components/sponsors/CSVImportModal";
import { Company } from "@/types";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";

export default function DiscoverPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [jobActive, setJobActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [results, setResults] = useState<Company[]>([]);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);

  const handleSearch = async (prompt: string, count: number) => {
    setLoading(true);
    setJobActive(true);
    setCurrentStep(0);
    setResults([]);

    try {
      // Step simulation for live progress feel
      setTimeout(() => setCurrentStep(1), 600);
      setTimeout(() => setCurrentStep(2), 1200);
      setTimeout(() => setCurrentStep(3), 1800);

      const res = await fetch("/api/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, targetCount: count }),
      });

      const data = await res.json();
      setTimeout(() => {
        setCurrentStep(4);
        setResults(data.candidates || []);
        setJobActive(false);
        setLoading(false);
        const skippedCount = Array.isArray(data.skipped) ? data.skipped.length : 0;
        toast(
          `Added ${data.count ?? 0} new sponsor(s)` +
            (skippedCount ? `, skipped ${skippedCount} already in the pipeline` : "") +
            ".",
          "success"
        );
      }, 2400);
    } catch (err) {
      toast("Discovery search failed", "error");
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

        <div>
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
        <CandidateList candidates={results} />
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
