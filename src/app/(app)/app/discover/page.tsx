"use client";

import React, { useState } from "react";
import { DiscoverPromptBox } from "@/components/discover/DiscoverPromptBox";
import { LiveJobProgress } from "@/components/discover/LiveJobProgress";
import { CandidateList } from "@/components/discover/CandidateList";
import { Company } from "@/types";
import { useToast } from "@/components/ui/toast";

export default function DiscoverPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [jobActive, setJobActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [results, setResults] = useState<Company[]>([]);

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
        toast(`Discovered ${data.count || 5} matching sponsors!`, "success");
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
      <div>
        <h1 className="font-heading font-black text-2xl sm:text-3xl text-green-dark">
          AI Sponsor Discovery Studio
        </h1>
        <p className="text-xs sm:text-sm text-text-dim mt-0.5">
          Hunt companies with active student programs, hackathon budgets, and tech synergy.
        </p>
      </div>

      {/* 1. Prompt Search Box */}
      <DiscoverPromptBox onSearch={handleSearch} loading={loading} />

      {/* 2. Live Job Progress Stream */}
      <LiveJobProgress active={jobActive} step={currentStep} />

      {/* 3. Streamed Candidates List */}
      <CandidateList candidates={results} />
    </div>
  );
}
