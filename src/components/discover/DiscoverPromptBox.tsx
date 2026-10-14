"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";
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
  const [count, setCount] = useState(20);

  const samplePrompts = [
    { text: "Find 20 cloud, developer tools and fintech companies sponsoring Indian student hackathons with ₹50k+ budgets", count: 20 },
    { text: "Find top 15 Web3 & AI companies actively sponsoring Indian college hackathons", count: 15 },
    { text: "Find 10 SaaS and dev tool companies with student ambassador programs", count: 10 },
    { text: "Find 10 fintech and developer API platforms with active hackathon grants", count: 10 },
  ];

  const countOptions = [5, 10, 15, 20, 25];

  const parseCountFromText = (text: string): number | null => {
    const leadMatch = text.match(/\b(?:find|get|show|top|search|discover|list)\s+(\d{1,2})\b/i);
    if (leadMatch) {
      const val = parseInt(leadMatch[1], 10);
      if (val >= 1 && val <= 30) return val;
    }
    const nounMatch = text.match(/\b(\d{1,2})\s+(?:[\w,&\s-]{0,40})\s*(?:companies|sponsors|brands|leads|startups)\b/i);
    if (nounMatch) {
      const val = parseInt(nounMatch[1], 10);
      if (val >= 1 && val <= 30) return val;
    }
    return null;
  };

  const handlePromptChange = (newVal: string) => {
    setPrompt(newVal);
    const detected = parseCountFromText(newVal);
    if (detected) {
      setCount(detected);
    }
  };

  const handleSelectCount = (val: number) => {
    setCount(val);
    // Replace any leading count in prompt if present
    setPrompt((prev) => {
      if (/\b(?:find|get|show|top)?\s*(\d{1,2})\b/i.test(prev)) {
        return prev.replace(/\b(?:find|get|show|top)?\s*(\d{1,2})\b/i, (m, oldNum) => m.replace(oldNum, String(val)));
      }
      return prev;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    onSearch(prompt, count);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-green-dark/12 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-green-dark">
          <Search className="w-4 h-4 text-green-mid" />
          Natural Language Sponsor Discovery
        </div>

        {/* Count Selector Pills */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <span className="text-[11px] font-bold text-text-muted mr-1">Target Count:</span>
          {countOptions.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => handleSelectCount(opt)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                count === opt
                  ? "bg-[#2D6A4F] text-white shadow-xs"
                  : "bg-butter-panel text-green-dark/70 hover:bg-butter-cream hover:text-green-dark border border-green-dark/10"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => handlePromptChange(e.target.value)}
            rows={3}
            className="w-full p-4 bg-butter-panel text-green-dark text-sm sm:text-base font-medium rounded-2xl border border-green-dark/20 focus:border-green-dark focus:ring-2 focus:ring-butter-cream/60 outline-none transition-all placeholder:text-text-muted"
            placeholder="Describe what kind of sponsors you need (e.g. Find 20 cloud and fintech companies...)"
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
                onClick={() => {
                  setPrompt(p.text);
                  setCount(p.count);
                }}
                className="px-2.5 py-1 rounded-lg bg-butter-warm/60 hover:bg-butter-cream text-green-dark text-[11px] font-semibold transition-colors text-left cursor-pointer"
              >
                {p.text.slice(0, 36)}...
              </button>
            ))}
          </div>

          <Button
            type="submit"
            variant="butter"
            size="md"
            loading={loading}
            className="font-bold shadow-md w-full sm:w-auto shrink-0 cursor-pointer"
          >
            <Search className="w-4 h-4 mr-1.5" /> Discover {count} Sponsors
          </Button>
        </div>
      </form>
    </div>
  );
};
