'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Clock, Send, User, MessageSquare, Brain, HelpCircle, CheckCircle, ArrowRight, Calendar } from 'lucide-react';
import { Message, Company, ReplyAnalysis, Meeting } from '@/types';
import { formatDate } from '@/lib/utils';
import { formatMeetingDateShort } from '@/lib/meetings/calendar-helpers';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ThreadViewProps {
  message: Message;
  company?: Company;
  allThreadMessages?: Message[];
  analysis?: ReplyAnalysis;
  showIntelligence?: boolean;
  onToggleIntelligence?: () => void;
  onComposeReply: () => void;
  meeting?: Meeting | null;
  onArrangeMeeting?: () => void;
}

export function ThreadView({
  message,
  company,
  allThreadMessages = [],
  analysis,
  showIntelligence,
  onToggleIntelligence,
  onComposeReply,
  meeting,
  onArrangeMeeting,
}: ThreadViewProps) {
  const [activeTab, setActiveTab] = useState<'stream' | 'intel'>('stream');
  const messagesToDisplay = allThreadMessages.length > 0 ? allThreadMessages : [message];

  const isDeclined = analysis?.intent === 'Not Interested' || (analysis?.intent as any) === 'Declined';
  const canArrangeMeeting = !isDeclined && (analysis?.intent === 'Interested' || analysis?.intent === 'Positive' || Boolean(analysis?.meetingRequested));

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FFFDF6] overflow-hidden min-w-0">
      {/* Header */}
      <div className="p-4 border-b border-[#0C382E]/10 bg-[#FFFFFF] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 shadow-xs">
        <div className="min-w-0 flex-1 pr-2">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h2
              className="font-heading font-bold text-base sm:text-lg text-[#0C382E] truncate max-w-xl"
              title={message.subject}
            >
              {message.subject}
            </h2>
            {company?.stage && (
              <Badge variant="green" className="text-[11px] shrink-0">
                {company.stage}
              </Badge>
            )}
            {analysis?.intent && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                {analysis.intent}
              </span>
            )}
          </div>
          <p className="text-xs text-[#0C382E]/60 truncate">
            Sponsor: <span className="font-semibold text-[#0C382E]">{company?.name || message.fromEmail.split('@')[0]}</span> •{' '}
            <span className="font-mono text-neutral-600">{message.fromEmail}</span>
          </p>
        </div>

        {/* Action Buttons: Strictly Non-Wrapping */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
          {/* Meeting Scheduled Badge vs Arrange Meeting Button */}
          {meeting ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold shrink-0">
              <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Meeting: {formatMeetingDateShort(meeting.startsAt)}</span>
              <Link
                href="/app/schedule"
                className="ml-1 text-[11px] underline text-emerald-900 hover:text-green-dark"
              >
                View in Schedule →
              </Link>
            </div>
          ) : (
            canArrangeMeeting &&
            onArrangeMeeting && (
              <Button
                onClick={onArrangeMeeting}
                variant="butter"
                size="sm"
                className="text-xs gap-1.5 font-bold whitespace-nowrap shrink-0 shadow-xs border border-[#0C382E]/15 text-[#0C382E]"
              >
                <Calendar className="w-3.5 h-3.5 shrink-0 text-[#0C382E]" />
                <span>Arrange Meeting</span>
              </Button>
            )
          )}

          <Button
            onClick={onComposeReply}
            variant="green"
            size="sm"
            className="text-xs gap-1.5 font-bold whitespace-nowrap shrink-0 shadow-sm"
          >
            <Mail className="w-3.5 h-3.5 shrink-0" />
            <span>Reply / Take Action</span>
          </Button>

          {onToggleIntelligence && (
            <Button
              onClick={onToggleIntelligence}
              variant={showIntelligence ? 'butter' : 'outline'}
              size="sm"
              className={cn(
                'text-xs gap-1.5 font-bold whitespace-nowrap shrink-0 border-[#0C382E]/20 transition-all',
                showIntelligence ? 'shadow-xs' : 'text-[#0C382E]'
              )}
              title="Toggle AI Intelligence side panel"
            >
              <Brain className="w-3.5 h-3.5 shrink-0" />
              <span>{showIntelligence ? 'Hide Intel' : 'Intel'}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Sub-navigation tabs inside Thread View for maximum breathing room */}
      <div className="bg-white border-b border-[#0C382E]/10 px-4 py-1.5 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('stream')}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer',
              activeTab === 'stream'
                ? 'bg-[#0C382E] text-[#FFF0B3]'
                : 'text-[#0C382E]/60 hover:text-[#0C382E] hover:bg-[#FAF4E6]'
            )}
          >
            <MessageSquare className="w-3 h-3" />
            <span>Conversation Stream</span>
          </button>

          {analysis && (
            <button
              onClick={() => setActiveTab('intel')}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer',
                activeTab === 'intel'
                  ? 'bg-[#0C382E] text-[#FFF0B3]'
                  : 'text-[#0C382E]/60 hover:text-[#0C382E] hover:bg-[#FAF4E6]'
              )}
            >
              <Brain className="w-3 h-3" />
              <span>Full Intel Breakdown</span>
            </button>
          )}
        </div>

        <span className="text-[11px] text-[#0C382E]/40 hidden md:inline">
          {activeTab === 'stream' ? `${messagesToDisplay.length} message(s)` : 'AI Analysis & Objection Summary'}
        </span>
      </div>

      {/* Tab 1: Conversation Message Stream */}
      {activeTab === 'stream' ? (
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {messagesToDisplay.map((msg: Message, index: number) => {
            const isOutbound = msg.direction === 'outbound';
            return (
              <div
                key={msg.id || index}
                className={`flex flex-col ${isOutbound ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-2 mb-1 px-1">
                  <div className="w-5 h-5 rounded-full bg-[#0C382E]/10 flex items-center justify-center text-[10px] font-bold text-[#0C382E]">
                    {isOutbound ? 'ME' : 'SP'}
                  </div>
                  <span className="text-xs font-semibold text-[#0C382E]">
                    {isOutbound ? 'You (via Connected Gmail)' : msg.fromEmail}
                  </span>
                  <span className="text-[10px] text-[#0C382E]/40 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {formatDate(msg.sentAt)}
                  </span>
                </div>

                <div
                  className={`max-w-[85%] md:max-w-[80%] p-4 md:p-5 rounded-2xl shadow-sm text-sm ${
                    isOutbound
                      ? 'bg-[#0C382E] text-[#FAF4E6] rounded-tr-sm'
                      : 'bg-[#FFFFFF] border border-[#0C382E]/10 text-[#0C382E] rounded-tl-sm'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans text-xs md:text-sm leading-relaxed">
                    {msg.body}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Tab 2: Full-Width Intel Breakdown */
        <div className="flex-1 overflow-y-auto p-6 max-w-4xl space-y-6 animate-fade-in">
          {analysis && (
            <div className="space-y-6">
              {/* Intent Card */}
              <div className="bg-white rounded-2xl p-5 border border-[#0C382E]/10 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-[#0C382E]/50 uppercase tracking-wider block mb-1">
                    Detected Sponsor Intent
                  </span>
                  <span className="text-xl font-black text-[#0C382E]">
                    {analysis.intent}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    {analysis.confidence}% Confidence
                  </span>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-white rounded-2xl p-5 border border-[#0C382E]/10 shadow-xs space-y-2">
                <h4 className="text-xs font-bold text-[#0C382E] uppercase tracking-wider">Executive Thread Summary</h4>
                <p className="text-sm text-[#0C382E]/80 leading-relaxed bg-[#FAF4E6]/50 p-4 rounded-xl border border-[#0C382E]/5">
                  {analysis.summary}
                </p>
              </div>

              {/* Questions */}
              {analysis.questions && analysis.questions.length > 0 && (
                <div className="bg-white rounded-2xl p-5 border border-[#0C382E]/10 shadow-xs space-y-3">
                  <h4 className="text-xs font-bold text-[#0C382E] uppercase tracking-wider flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-[#B25E00]" />
                    <span>Questions & Inquiries to Address ({analysis.questions.length})</span>
                  </h4>
                  <ul className="space-y-2">
                    {analysis.questions.map((q: string, i: number) => (
                      <li key={i} className="text-xs md:text-sm text-[#0C382E] bg-[#FFF8E1] p-3 rounded-xl border border-[#FEE790]/60">
                        • {q}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Banner */}
              <div className="bg-gradient-to-r from-[#0C382E] to-[#154D40] text-[#FFF0B3] p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-bold text-[#FFF0B3]/70 uppercase tracking-wider block mb-0.5">
                    Recommended Next Action
                  </span>
                  <p className="text-sm font-bold text-white">
                    {analysis.nextAction}
                  </p>
                  {meeting && (
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/70 text-emerald-200 border border-emerald-500/30 text-xs">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Meeting booked for {formatMeetingDateShort(meeting.startsAt)}</span>
                      <Link href="/app/schedule" className="underline text-butter-cream hover:text-white font-bold ml-1">
                        View →
                      </Link>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!meeting && canArrangeMeeting && onArrangeMeeting && (
                    <Button
                      onClick={onArrangeMeeting}
                      variant="butter"
                      size="sm"
                      className="font-bold shrink-0 text-xs gap-1.5"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Arrange Meeting</span>
                    </Button>
                  )}
                  <Button
                    onClick={onComposeReply}
                    variant="outline"
                    size="sm"
                    className="font-bold shrink-0 text-xs gap-1.5 bg-white/10 text-white border-white/20 hover:bg-white/20"
                  >
                    <span>Execute Reply Draft</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
