'use client';

import React from 'react';
import { Clock, BellRing } from 'lucide-react';
import { SequenceConfigCard } from '@/components/followups/SequenceConfigCard';
import { FollowupQueue } from '@/components/followups/FollowupQueue';
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
              Drafts follow-ups for sponsors who haven't replied. You approve every one.
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

      {/* Real follow-up queue, computed from the emails you actually sent */}
      <FollowupQueue />
    </div>
  );
}
