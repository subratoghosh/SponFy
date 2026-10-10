'use client';

import React from 'react';
import { RefreshCw, Clock, Sparkles, Filter, BellRing } from 'lucide-react';
import { SequenceConfigCard } from '@/components/followups/SequenceConfigCard';
import { DueTasksList } from '@/components/followups/DueTasksList';
import { Button } from '@/components/ui/button';

export default function FollowupsPage() {
  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#0C382E] text-[#FFF0B3] flex items-center justify-center shadow-md">
            <BellRing className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-heading font-bold text-2xl text-[#0C382E]">Follow-ups Engine</h1>
            <p className="text-xs text-[#0C382E]/60">
              Smart automated cadences with human approval gates and instant reply auto-halts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="border-[#0C382E]/20 text-[#0C382E]">
            <Clock className="w-3.5 h-3.5 mr-1.5" />
            Cadence Settings
          </Button>
        </div>
      </div>

      {/* Sequence Configuration Overview */}
      <SequenceConfigCard />

      {/* Follow-up Tasks Due */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="font-heading font-bold text-lg text-[#0C382E]">Pending Follow-up Approvals</h2>
            <span className="px-2 py-0.5 rounded-full bg-[#0C382E] text-[#FFF0B3] text-xs font-bold">3 Due</span>
          </div>
          <span className="text-xs text-[#0C382E]/50">Evaluated every 24 hours against Gmail thread state</span>
        </div>

        <DueTasksList />
      </div>
    </div>
  );
}
