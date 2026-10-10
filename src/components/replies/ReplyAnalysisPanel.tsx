'use client';

import React from 'react';
import { Brain, HelpCircle, CheckCircle, ArrowRight, Zap } from 'lucide-react';
import { ReplyAnalysis } from '@/types';
import { Badge } from '@/components/ui/badge';

interface ReplyAnalysisPanelProps {
  analysis?: ReplyAnalysis;
  onExecuteRecommendation?: () => void;
}

export function ReplyAnalysisPanel({ analysis, onExecuteRecommendation }: ReplyAnalysisPanelProps) {
  if (!analysis) {
    return (
      <div className="w-80 border-l border-[#0C382E]/10 bg-[#FFFFFF] p-6 flex flex-col items-center justify-center text-center">
        <Brain className="w-8 h-8 text-[#0C382E]/30 mb-2 animate-pulse" />
        <p className="text-xs text-[#0C382E]/50 font-medium">No AI reply analysis available for this message yet.</p>
      </div>
    );
  }

  const getIntentBadgeVariant = (intent: string): "success" | "warning" | "error" | "info" => {
    switch (intent.toLowerCase()) {
      case 'interested':
      case 'positive':
        return 'success';
      case 'question':
      case 'more info':
        return 'warning';
      case 'not interested':
      case 'declined':
        return 'error';
      default:
        return 'info';
    }
  };

  return (
    <div className="w-80 border-l border-[#0C382E]/10 bg-[#FFFFFF] flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-[#0C382E]/10 bg-[#FFFDF6]">
        <div className="flex items-center gap-2 mb-1 text-[#0C382E]">
          <Brain className="w-4 h-4 text-[#0C382E]" />
          <h3 className="font-heading font-bold text-sm">AI Reply Intelligence</h3>
        </div>
        <p className="text-[11px] text-[#0C382E]/60">Classified using Gemini with intent & requirement extraction</p>
      </div>

      <div className="p-4 space-y-5">
        {/* Intent & Confidence */}
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#0C382E]/50 mb-1.5">Detected Intent</div>
          <div className="flex items-center justify-between">
            <Badge variant={getIntentBadgeVariant(analysis.intent)} className="text-xs capitalize font-bold">
              {analysis.intent}
            </Badge>
            <span className="text-xs font-mono font-bold text-[#0C382E]">
              {analysis.confidence}% confidence
            </span>
          </div>
        </div>

        {/* Executive Summary */}
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#0C382E]/50 mb-1.5">Summary</div>
          <p className="text-xs text-[#0C382E]/80 leading-relaxed bg-[#FAF4E6]/50 p-2.5 rounded-xl border border-[#0C382E]/5">
            {analysis.summary}
          </p>
        </div>

        {/* Questions Asked */}
        {analysis.questions && analysis.questions.length > 0 && (
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#0C382E]/50 mb-1.5 flex items-center gap-1">
              <HelpCircle className="w-3 h-3 text-[#B25E00]" />
              Questions Asked ({analysis.questions.length})
            </div>
            <ul className="space-y-1.5">
              {analysis.questions.map((q: string, i: number) => (
                <li key={i} className="text-xs text-[#0C382E] bg-[#FFF8E1] p-2 rounded-lg border border-[#FEE790]/60">
                  • {q}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Requested Info / Collateral */}
        {analysis.requestedInfo && analysis.requestedInfo.length > 0 && (
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#0C382E]/50 mb-1.5 flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-[#0C382E]" />
              Requested Material
            </div>
            <div className="flex flex-wrap gap-1.5">
              {analysis.requestedInfo.map((info: string, i: number) => (
                <span key={i} className="text-[11px] font-medium bg-[#0C382E]/5 text-[#0C382E] px-2 py-0.5 rounded-md border border-[#0C382E]/10">
                  {info}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Action CTA */}
        <div className="pt-2 border-t border-[#0C382E]/10">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#0C382E]/50 mb-2 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-[#0C382E]" />
            Recommended Next Step
          </div>
          <div className="bg-[#0C382E]/5 p-3 rounded-xl border border-[#0C382E]/10 mb-3">
            <div className="text-xs font-bold text-[#0C382E] mb-1">
              {analysis.nextAction}
            </div>
            <p className="text-[11px] text-[#0C382E]/70 leading-normal">
              Sentiment is {analysis.sentiment}. Meeting requested: {analysis.meetingRequested ? 'Yes' : 'No'}.
            </p>
          </div>

          <button
            onClick={onExecuteRecommendation}
            className="w-full py-2.5 px-3 rounded-xl bg-[#0C382E] text-[#FFF0B3] text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#0C382E]/90 transition-all shadow-sm active:scale-98"
          >
            <span>Execute Action</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
