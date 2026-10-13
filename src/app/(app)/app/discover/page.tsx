"use client";

import React, { useState, useEffect } from "react";
import { DiscoverPromptBox } from "@/components/discover/DiscoverPromptBox";
import { LiveJobProgress } from "@/components/discover/LiveJobProgress";
import { CandidateList, CandidateItem } from "@/components/discover/CandidateList";
import { CandidateListSkeleton } from "@/components/skeletons/CandidateListSkeleton";
import { CSVImportModal } from "@/components/sponsors/CSVImportModal";
import { Campaign } from "@/types";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Layers } from "lucide-react";

export default function DiscoverPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [jobActive, setJobActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [results, setResults] = useState<CandidateItem[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [approving, setApproving] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");

  const loadSavedResults = (campId?: string) => {
    const url = campId ? `/api/discover/results?campaignId=${encodeURIComponent(campId)}` : "/api/discover/results";
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setResults(data.data);
          if (data.data.length > 0) setHasSearched(true);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetch("/api/campaigns")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setCampaigns(data.data);
          const firstId = data.data[0].id;
          setSelectedCampaignId(firstId);
          loadSavedResults(firstId);
        }
      })
      .catch(() => {});
  }, []);

  const handleCampaignChange = (newCampId: string) => {
    setSelectedCampaignId(newCampId);
    loadSavedResults(newCampId);
  };

  const handleSearch = async (prompt: string, count: number) => {
    setLoading(true);
    setJobActive(true);
    setCurrentStep(0);
    setHasSearched(true);

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

        if (candidates.length > 0) {
          toast(
            `Discovered ${candidates.length} prospective sponsor(s)! Review and select companies to approve for outreach.`,
            "success"
          );
        } else {
          toast("No new companies found for this query. Try a broader search term.", "info");
        }
      }, 2200);
    } catch (err: any) {
      toast(err?.message || "Discovery search failed", "error");
      setLoading(false);
      setJobActive(false);
    }
  };

  const handleApproveSelected = async (candidateIds: string[]) => {
    if (!selectedCampaignId) {
      toast("Select an active campaign first", "error");
      return;
    }
    setApproving(true);
    try {
      const res = await fetch("/api/sponsors/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId: selectedCampaignId,
          candidateIds,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Approval failed");
      }

      toast(
        `Approved ${data.approvedCount} sponsor(s) into your pipeline!` +
          (data.alreadyApprovedCount ? ` (${data.alreadyApprovedCount} already tracked)` : ""),
        "success"
      );

      // Refresh list
      loadSavedResults(selectedCampaignId);
    } catch (err: any) {
      toast(err.message || "Failed to approve candidates", "error");
    } finally {
      setApproving(false);
    }
  };

  const handleApproveAll = async () => {
    if (!selectedCampaignId) {
      toast("Select an active campaign first", "error");
      return;
    }
    setApproving(true);
    try {
      const res = await fetch("/api/sponsors/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId: selectedCampaignId,
          all: true,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Approval failed");
      }

      toast(
        `Approved all ${data.approvedCount} sponsor(s) into your pipeline!` +
          (data.alreadyApprovedCount ? ` (${data.alreadyApprovedCount} already tracked)` : ""),
        "success"
      );

      // Refresh list
      loadSavedResults(selectedCampaignId);
    } catch (err: any) {
      toast(err.message || "Failed to approve candidates", "error");
    } finally {
      setApproving(false);
    }
  };

  const handleClearResults = async () => {
    if (!selectedCampaignId) return;
    try {
      const res = await fetch(`/api/discover/results?campaignId=${encodeURIComponent(selectedCampaignId)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setResults([]);
        toast("Cleared discovery candidate list. Saved pipeline sponsors remain untouched.", "info");
      }
    } catch {
      toast("Failed to clear results", "error");
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
                onChange={(e) => handleCampaignChange(e.target.value)}
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
          onApproveSelected={handleApproveSelected}
          onApproveAll={handleApproveAll}
          onClearResults={handleClearResults}
          approving={approving}
        />
      )}

      {/* CSV Import Modal */}
      <CSVImportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        onSuccess={() => {
          toast("CSV companies loaded into tracker!", "success");
          window.location.href = "/app/sponsors";
        }}
      />
    </div>
  );
}
