'use client';

import React, { useState } from 'react';
import { Send, RefreshCw, ShieldCheck } from 'lucide-react';
import { Message, Company, ReplyAnalysis } from '@/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

interface ReplyComposerModalProps {
  message: Message | null;
  company?: Company;
  analysis?: ReplyAnalysis | null;
  isOpen: boolean;
  onClose: () => void;
  onSend: (replyContent: { subject: string; body: string }) => void;
}

export function ReplyComposerModal({
  message,
  company,
  analysis,
  isOpen,
  onClose,
  onSend,
}: ReplyComposerModalProps) {
  const defaultSubject = message?.subject?.startsWith('Re:') ? message.subject : `Re: ${message?.subject || ''}`;
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState(
    `Hi,\n\nThank you for getting back to us regarding ${company?.name || 'your'} sponsorship partnership.\n\nWe have attached our comprehensive Tier Deck and partnership guidelines. We'd love to schedule a brief 15-minute sync with your team this Thursday at 4 PM IST.\n\nLooking forward to partnering together!\n\nBest regards,\nSponsorship Lead`
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);

  if (!message) return null;

  const handleAISuggest = () => {
    setIsGenerating(true);
    setTimeout(() => {
      if (analysis?.meetingRequested) {
        setBody(
          `Hi,\n\nDelighted to jump on a quick call! Here is our team calendar link to pick any 15-min slot that suits your schedule: cal.com/sponsor-sync\n\nAlternatively, does tomorrow (Friday) at 3:30 PM IST work for you?\n\nWarm regards,\nSponsorship Lead`
        );
      } else {
        setBody(
          `Hi,\n\nThank you for the follow up! In response to your question: our team welcomes both onsite and virtual mentors, and we provide dedicated track guidelines for ${company?.name || 'your company'}.\n\nBest regards,\nSponsorship Lead`
        );
      }
      setIsGenerating(false);
    }, 600);
  };

  const handleSend = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      onSend({ subject, body });
      onClose();
    }, 500);
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogContent className="sm:max-w-2xl bg-[#FFFDF6] border-[#0C382E]/10 p-0 overflow-hidden">
        <DialogHeader className="p-5 bg-[#FFFFFF] border-b border-[#0C382E]/10">
          <div className="flex items-center justify-between">
            <DialogTitle className="font-heading font-bold text-lg text-[#0C382E]">
              Compose Reply to {company?.name || message.fromEmail}
            </DialogTitle>
          </div>
          <p className="text-xs text-[#0C382E]/60">
            Sending to: <span className="font-semibold text-[#0C382E]">{message.fromEmail}</span>
          </p>
        </DialogHeader>

        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between bg-[#FFF0B3]/40 border border-[#FEE790] p-2.5 rounded-xl">
            <div className="flex items-center gap-2 text-xs text-[#0C382E] font-medium">
              <ShieldCheck className="w-4 h-4 text-[#0C382E]" />
              <span>Human approval required before dispatch via connected Gmail.</span>
            </div>
            <button
              onClick={handleAISuggest}
              disabled={isGenerating}
              className="px-2.5 py-1 rounded-lg bg-[#0C382E] text-[#FFF0B3] text-xs font-semibold flex items-center gap-1.5 hover:bg-[#0C382E]/90 disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 text-[#FEE790] ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? 'Drafting...' : 'AI Re-Draft'}
            </button>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#0C382E]/70 mb-1 block">Subject</label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="bg-[#FFFFFF] text-xs font-medium"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#0C382E]/70 mb-1 block">Email Message</label>
            <Textarea
              rows={8}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="bg-[#FFFFFF] text-xs font-mono leading-relaxed"
            />
          </div>
        </div>

        <DialogFooter className="p-4 bg-[#FFFFFF] border-t border-[#0C382E]/10 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            variant="green"
            onClick={handleSend}
            disabled={isSending || !body.trim()}
            className="gap-2 font-bold"
          >
            <Send className="w-4 h-4" />
            {isSending ? 'Sending via Gmail...' : 'Send Approved Reply'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
