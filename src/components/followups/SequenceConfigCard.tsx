'use client';

import React from 'react';
import { Clock, ShieldCheck, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SequenceStep {
  step: number;
  label: string;
  delayDays: number;
  description: string;
  type: string;
}

const DEFAULT_STEPS: SequenceStep[] = [
  {
    step: 1,
    label: 'Initial Personalized Pitch',
    delayDays: 0,
    description: 'Deeply researched cold pitch citing verified developer tracks & sponsorship tiers.',
    type: 'Initial Outreach',
  },
  {
    step: 2,
    label: 'Gentle Context Bump',
    delayDays: 3,
    description: 'Short 3-sentence note referencing the previous deck and highlighting speaker slot availability.',
    type: 'Follow-up 1',
  },
  {
    step: 3,
    label: 'Value Add & Metric Update',
    delayDays: 7,
    description: 'Share updated builder registrations count and student community demographics.',
    type: 'Follow-up 2',
  },
  {
    step: 4,
    label: 'Graceful Tier Closeout',
    delayDays: 12,
    description: 'Polite break-up note mentioning title track lock-in date and keeping the door open for next edition.',
    type: 'Break-up',
  },
];

export function SequenceConfigCard() {
  return (
    <Card className="bg-[#FFFFFF] border-[#0C382E]/10 shadow-sm">
      <CardHeader className="pb-3 border-b border-[#0C382E]/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#0C382E]">
            <Clock className="w-5 h-5 text-[#0C382E]" />
            <CardTitle className="text-base font-heading font-bold">Standard 4-Touch Follow-up Sequence</CardTitle>
          </div>
          <Badge variant="success" className="text-xs">
            <CheckCircle className="w-3 h-3 mr-1" />
            Auto-halts on any reply
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative">
          {DEFAULT_STEPS.map((step) => (
            <div
              key={step.step}
              className="bg-[#FFFDF6] p-4 rounded-xl border border-[#0C382E]/10 flex flex-col justify-between hover:border-[#0C382E]/30 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="w-6 h-6 rounded-full bg-[#0C382E] text-[#FFF0B3] text-xs font-bold flex items-center justify-center">
                    {step.step}
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    {step.delayDays === 0 ? 'Day 0' : `+${step.delayDays} days`}
                  </Badge>
                </div>
                <h4 className="font-heading font-bold text-xs text-[#0C382E] mb-1">{step.label}</h4>
                <p className="text-[11px] text-[#0C382E]/70 leading-relaxed">{step.description}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-[#0C382E]/5 flex items-center justify-between text-[10px] text-[#0C382E]/50 font-medium">
                <span>{step.type}</span>
                <span className="text-[#0C382E] font-semibold">Human Approved</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-[#FAF4E6] rounded-xl border border-[#0C382E]/10 flex items-center gap-2 text-xs text-[#0C382E]">
          <ShieldCheck className="w-4 h-4 text-[#0C382E] shrink-0" />
          <span>
            <strong>Safety Guaranteed:</strong> SponFy never dispatches follow-ups without manual approval in your queue. If a sponsor replies in Gmail or un-subscribes, all subsequent follow-ups are automatically cancelled.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
