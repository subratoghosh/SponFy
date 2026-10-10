"use client";

import React, { useState } from "react";
import { Sparkles, Search, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DiscoverPromptBoxProps {
  onSearch: (prompt: string, count: number) => void;
  loading: boolean;
}

export const DiscoverPromptBox: React.FC<DiscoverPromptBoxProps> = ({
  onSearch,
  loading,
}) => {
  const [prompt, setPrompt] = useState(
    "Find 20 cloud, developer tools and fintech companies sponsoring Indian student hackathons with ₹50k+ budgets"
  );
  const [count, setCount] = useState(5);

  const samplePrompts = [
    "Find top 10 Web3 & AI companies actively sponsoring Indian college hackathons",
    "Find SaaS companies with student ambassador programs in Gujarat and Maharashtra",
    "Find fintech and developer API platforms with active startup grants",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    onSearch(prompt, count);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-green-dark/12 shadow-sm space-y-4">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-green-dark">
        <Sparkles className="w-4 h-4 text-green-mid" />
        Natural Language Sponsor Discovery
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            className="w-full p-4 bg-butter-panel text-green-dark text-sm sm:text-base font-medium rounded-2xl border border-green-dark/20 focus:border-green-dark focus:ring-2 focus:ring-butter-cream/60 outline-none transition-all placeholder:text-text-muted"
            placeholder="Describe what kind of sponsors you need..."
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Quick Suggestions */}
          <div className="flex flex-wrap gap-1.5 text-xs">
            <span className="text-text-muted font-bold self-center">Try:</span>
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setPrompt(p)}
                className="px-2.5 py-1 rounded-lg bg-butter-warm/60 hover:bg-butter-cream text-green-dark text-[11px] font-semibold transition-colors text-left"
              >
                {p.slice(0, 35)}...
              </button>
            ))}
          </div>

          <Button
            type="submit"
            variant="butter"
            size="md"
            loading={loading}
            className="font-bold shadow-md w-full sm:w-auto shrink-0"
          >
            <Search className="w-4 h-4 mr-1" /> Discover Sponsors
          </Button>
        </div>
      </form>
    </div>
  );
};
