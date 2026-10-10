'use client';

import React, { useState, useEffect } from 'react';
import { Mail, RefreshCw, Inbox } from 'lucide-react';
import { getInboundThreads } from '@/lib/data/repositories/replies';
import { getSponsors } from '@/lib/data/repositories/sponsors';
import { Message, ReplyAnalysis, Company } from '@/types';
import { ThreadList } from '@/components/replies/ThreadList';
import { ThreadView } from '@/components/replies/ThreadView';
import { ReplyAnalysisPanel } from '@/components/replies/ReplyAnalysisPanel';
import { ReplyComposerModal } from '@/components/replies/ReplyComposerModal';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import { InboxSkeleton } from '@/components/skeletons/InboxSkeleton';

export default function RepliesPage() {
  const [threadItems, setThreadItems] = useState<Array<{ message: Message; analysis?: ReplyAnalysis }>>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [filterIntent, setFilterIntent] = useState<string>('all');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [showIntelligence, setShowIntelligence] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [threads, comps] = await Promise.all([
        getInboundThreads(),
        getSponsors(),
      ]);
      setThreadItems(threads);
      setCompanies(comps);
      if (threads.length > 0 && !selectedMessageId) {
        setSelectedMessageId(threads[0].message.id);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/replies/sync', { method: 'POST' });
      const result = await res.json();
      toast('Inbox synchronized with connected Gmail', 'success');
      loadData();
    } catch {
      toast('Failed to sync inbox', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredThreads = threadItems.filter((item) => {
    if (filterIntent === 'all') return true;
    return item.analysis?.intent.toLowerCase() === filterIntent.toLowerCase();
  });

  const selectedItem =
    threadItems.find((t) => t.message.id === selectedMessageId) || threadItems[0] || null;

  const selectedCompany = selectedItem
    ? companies.find((c) => c.id === selectedItem.message.companyId)
    : undefined;

  const handleSendReply = (replyData: { subject: string; body: string }) => {
    if (!selectedItem) return;
    toast(`Reply sent to ${selectedCompany?.name || selectedItem.message.fromEmail}!`, 'success');
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-[#FAF4E6]">
      {/* Top action bar */}
      <div className="p-3 md:p-4 bg-[#FFFFFF] border-b border-[#0C382E]/10 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0C382E]/5 border border-[#0C382E]/10 flex items-center justify-center text-[#0C382E] shrink-0">
            <Inbox className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-heading font-bold text-lg md:text-xl text-[#0C382E]">Replies Inbox</h1>
            <p className="text-xs text-[#0C382E]/60 hidden sm:block">
              AI-classified thread responses with one-click approved replies
            </p>
          </div>
        </div>

        {/* Action Controls & Options */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Intent filter pills */}
          <div className="flex items-center gap-1 bg-[#FAF4E6] p-1 rounded-xl border border-[#0C382E]/10">
            {['all', 'interested', 'question', 'declined'].map((intent) => (
              <button
                key={intent}
                onClick={() => setFilterIntent(intent)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer ${
                  filterIntent === intent
                    ? 'bg-[#0C382E] text-[#FFF0B3] shadow-xs'
                    : 'text-[#0C382E]/60 hover:text-[#0C382E]'
                }`}
              >
                {intent === 'all' ? 'All' : intent}
              </button>
            ))}
          </div>

          {/* Toggle Buttons: AI Intelligence & Sidebar */}
          <button
            onClick={() => setShowIntelligence(!showIntelligence)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              showIntelligence
                ? 'bg-[#0C382E] text-[#FFF0B3] border-[#0C382E] shadow-xs'
                : 'bg-white text-[#0C382E] border-[#0C382E]/20 hover:bg-[#FAF4E6]'
            }`}
            title="Toggle AI Intelligence inspector panel"
          >
            AI Intel Panel: {showIntelligence ? 'Open' : 'Closed'}
          </button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={isSyncing}
            className="border-[#0C382E]/20 text-[#0C382E] gap-1.5 h-8 text-xs font-bold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Gmail'}</span>
          </Button>
        </div>
      </div>

      {/* Main Inbox Layout: Spacious & Uncongested */}
      {loading ? (
        <InboxSkeleton />
      ) : (
        <div className="flex-1 flex overflow-hidden">
          {/* Column 1: Thread List */}
          {isSidebarOpen && (
            <div className="w-72 md:w-80 lg:w-84 border-r border-[#0C382E]/10 bg-[#FFFFFF] flex flex-col shrink-0 animate-fade-in">
              <ThreadList
                threads={filteredThreads}
                companies={companies}
                selectedMessageId={selectedMessageId}
                onSelectThread={(id) => setSelectedMessageId(id)}
              />
            </div>
          )}

          {/* Column 2: Spacious Thread View */}
          {selectedItem ? (
            <ThreadView
              message={selectedItem.message}
              company={selectedCompany}
              analysis={selectedItem.analysis}
              showIntelligence={showIntelligence}
              onToggleIntelligence={() => setShowIntelligence(!showIntelligence)}
              onComposeReply={() => setIsComposerOpen(true)}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-8 bg-[#FFFDF6]">
              <div>
                <Mail className="w-12 h-12 text-[#0C382E]/20 mx-auto mb-3" />
                <p className="text-sm font-semibold text-[#0C382E]/60">Select a message to view thread conversation</p>
              </div>
            </div>
          )}

          {/* Column 3: AI Intelligence Panel (Revealed on-demand) */}
          {showIntelligence && selectedItem && (
            <ReplyAnalysisPanel
              analysis={selectedItem.analysis}
              onClose={() => setShowIntelligence(false)}
              onExecuteRecommendation={() => setIsComposerOpen(true)}
            />
          )}
        </div>
      )}

      {/* Reply Composer Modal */}
      <ReplyComposerModal
        message={selectedItem?.message || null}
        company={selectedCompany}
        analysis={selectedItem?.analysis}
        isOpen={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
        onSend={handleSendReply}
      />
    </div>
  );
}
