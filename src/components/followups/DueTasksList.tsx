'use client';

import React, { useState } from 'react';
import { Clock, Send, Sparkles, CheckCircle, Trash2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/toast';

interface DueFollowup {
  id: string;
  sponsorName: string;
  contactName: string;
  contactEmail: string;
  stepNumber: number;
  daysWaiting: number;
  lastSentSubject: string;
  aiSuggestedSubject: string;
  aiSuggestedAngle: string;
}

const INITIAL_DUE_FOLLOWUPS: DueFollowup[] = [
  {
    id: 'fu-1',
    sponsorName: 'Polygon Labs',
    contactName: 'Aakash Gupta',
    contactEmail: 'aakash@polygon.technology',
    stepNumber: 2,
    daysWaiting: 4,
    lastSentSubject: 'Polygon x SponFy Hackathon 2026: Web3 Track Sponsorship Deck',
    aiSuggestedSubject: 'Re: Polygon x SponFy Hackathon 2026: Web3 Track Sponsorship Deck',
    aiSuggestedAngle: 'Mention that 340+ developers have pre-registered specifically for the Ethereum/Polygon scaling bounty track.',
  },
  {
    id: 'fu-2',
    sponsorName: 'Twilio India',
    contactName: 'Siddharth Roy',
    contactEmail: 'siddharth@twilio.com',
    stepNumber: 2,
    daysWaiting: 5,
    lastSentSubject: 'Twilio Developer Track & Live Mentorship - SponFy Fest 2026',
    aiSuggestedSubject: 'Re: Twilio Developer Track & Live Mentorship - SponFy Fest 2026',
    aiSuggestedAngle: 'Highlight that college developer society members requested WhatsApp API and SendGrid workshop credits.',
  },
  {
    id: 'fu-3',
    sponsorName: 'Razorpay',
    contactName: 'Rohit Kulkarni',
    contactEmail: 'rohit.kulkarni@razorpay.com',
    stepNumber: 3,
    daysWaiting: 8,
    lastSentSubject: 'Razorpay Magic Checkout Hackathon Challenge Partnership',
    aiSuggestedSubject: 'Fintech track slot reservation for Razorpay - SponFy 2026',
    aiSuggestedAngle: 'Remind that fintech title tracks close next week; provide direct link to event deck.',
  },
];

export function DueTasksList() {
  const [tasks, setTasks] = useState<DueFollowup[]>(INITIAL_DUE_FOLLOWUPS);

  const handleApprove = (task: DueFollowup) => {
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    toast(`Follow-up approved and queued for ${task.sponsorName}!`, 'success');
  };

  const handleDismiss = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    toast('Follow-up task dismissed', 'info');
  };

  if (tasks.length === 0) {
    return (
      <div className="bg-[#FFFFFF] border border-[#0C382E]/10 rounded-2xl p-12 text-center shadow-sm">
        <CheckCircle className="w-12 h-12 text-[#0C382E] mx-auto mb-3" />
        <h3 className="font-heading font-bold text-lg text-[#0C382E]">All follow-ups are up to date!</h3>
        <p className="text-xs text-[#0C382E]/60 max-w-md mx-auto mt-1">
          No pending touchpoints require your review today. SponFy will notify you when new follow-up windows open.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#0C382E]/10 shadow-sm hover:border-[#0C382E]/25 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-heading font-bold text-[#0C382E] text-base">{task.sponsorName}</span>
              <Badge variant="outline" className="text-xs font-semibold">
                Step {task.stepNumber} of 4
              </Badge>
              <Badge variant="warning" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                {task.daysWaiting} days since last touch
              </Badge>
            </div>

            <div className="text-xs text-[#0C382E]/60 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>{task.contactName} ({task.contactEmail})</span>
            </div>

            <div className="bg-[#FAF4E6] p-3 rounded-xl border border-[#0C382E]/5">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#0C382E] mb-1">
                <Sparkles className="w-3.5 h-3.5 text-[#0C382E]" />
                <span>AI Recommended Angle:</span>
              </div>
              <p className="text-xs text-[#0C382E]/80 leading-relaxed font-sans">{task.aiSuggestedAngle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:flex-col md:items-end shrink-0">
            <Button
              size="sm"
              variant="green"
              onClick={() => handleApprove(task)}
              className="gap-1.5 font-bold shadow-sm text-xs"
            >
              <Send className="w-3.5 h-3.5" />
              Approve Follow-up
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDismiss(task.id)}
              className="text-[#0C382E]/60 hover:text-red-600 text-xs"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Skip Task
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
