'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle,
  Clock,
  Send,
  User,
  ShieldCheck,
  CheckSquare,
  Square,
  XCircle,
  Loader2,
  AlertTriangle,
  RefreshCw,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import type { FollowupItem } from '@/lib/outreach/followups';

interface Summary {
  due: number;
  draftReady: number;
  waiting: number;
  replied: number;
  complete: number;
}

const STATE_LABEL: Record<FollowupItem['state'], string> = {
  due: 'Follow-up due',
  draft_ready: 'Draft ready',
  waiting: 'Waiting',
  replied: 'Replied',
  closed: 'Closed',
  suppressed: 'Do not contact',
  complete: 'Sequence finished',
};

export function FollowupQueue() {
  const { toast } = useToast();
  const [items, setItems] = useState<FollowupItem[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [batchActionBusy, setBatchActionBusy] = useState(false);
  const [confirmBulkSend, setConfirmBulkSend] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/followups', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load follow-ups');
      setItems(data.items || []);
      setSummary(data.summary || null);
    } catch (err: any) {
      toast(err.message || 'Failed to load follow-ups', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const handleSyncGmail = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/replies/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.syncedCount > 0) {
          toast(`Synced ${data.syncedCount} new reply(ies) from Gmail! Follow-up statuses updated.`, 'success');
        } else {
          toast('Gmail inbox is up to date. No new replies found.', 'info');
        }
        await load();
      } else {
        toast(data.error || 'Failed to sync replies from Gmail', 'error');
      }
    } catch (err: any) {
      toast(err.message || 'Failed to sync Gmail inbox', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    load();
    // Background sync on initial mount
    fetch('/api/replies/sync', { method: 'POST' })
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.syncedCount > 0) {
          load();
        }
      })
      .catch(() => {});
  }, [load]);

  const attention = items.filter((i) => i.state === 'due' || i.state === 'draft_ready');
  const waiting = items.filter((i) => i.state === 'waiting');
  const replied = items.filter((i) => i.state === 'replied');
  const finished = items.filter((i) => !['due', 'draft_ready', 'waiting', 'replied'].includes(i.state));

  const eligibleForDrafting = attention.filter((i) => i.state === 'due');
  const eligibleForBulkSend = attention.filter((i) => i.state === 'draft_ready' && i.pendingDraft?.status === 'approved');

  const toggleSelect = (companyId: string) => {
    setSelectedIds((prev) =>
      prev.includes(companyId) ? prev.filter((id) => id !== companyId) : [...prev, companyId]
    );
  };

  const selectAllAttention = () => {
    setSelectedIds(attention.map((i) => i.companyId));
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const handleBulkDraft = async () => {
    const toDraft = selectedIds.length > 0 ? selectedIds : eligibleForDrafting.map((i) => i.companyId);
    if (toDraft.length === 0) return;
    setBatchActionBusy(true);
    try {
      const res = await fetch('/api/followups/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyIds: toDraft }),
      });
      const data = await res.json();
      if (data.success) {
        toast(`Generated ${data.createdCount || toDraft.length} follow-up draft(s). Review before sending.`, 'success');
        setSelectedIds([]);
        load();
      } else {
        toast(data.error || 'Bulk draft generation failed', 'error');
      }
    } catch (err: any) {
      toast(err.message || 'Failed to draft follow-ups', 'error');
    } finally {
      setBatchActionBusy(false);
    }
  };

  const handleBulkSendApproved = async () => {
    if (eligibleForBulkSend.length === 0) return;
    setBatchActionBusy(true);
    let successCount = 0;
    let failCount = 0;

    for (const item of eligibleForBulkSend) {
      if (!item.pendingDraft) continue;
      try {
        const res = await fetch('/api/outreach/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            draftId: item.pendingDraft.id,
            toEmail: item.recipientEmail,
          }),
        });
        const data = await res.json();
        if (data.success) {
          successCount++;
        } else {
          failCount++;
        }
      } catch {
        failCount++;
      }
    }

    setBatchActionBusy(false);
    setConfirmBulkSend(false);
    if (successCount > 0) {
      toast(`Sent ${successCount} follow-up email(s)!`, 'success');
    }
    if (failCount > 0) {
      toast(`${failCount} follow-up send(s) failed or were excluded.`, 'error');
    }
    load();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-sm text-[#0C382E]/60 gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-[#0C382E]" />
        <span>Loading follow-up queue...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Gmail Sync Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-green-dark">
            Follow-up Queue
          </h1>
          <p className="text-xs sm:text-sm text-text-dim mt-0.5">
            Automated multi-touch outreach tracking synced directly with your Gmail inbox.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSyncGmail}
            disabled={isSyncing}
            className="font-bold border-[#0C382E]/20 text-[#0C382E] hover:bg-[#FAF4E6] gap-1.5 shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 text-[#2D6A4F] ${isSyncing ? "animate-spin" : ""}`} />
            <span>{isSyncing ? "Syncing Gmail..." : "Sync Gmail Inbox"}</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Need follow-up" value={(summary?.due ?? 0) + (summary?.draftReady ?? 0)} />
        <Stat label="Waiting for window" value={summary?.waiting ?? 0} />
        <Stat label="Replied (halted)" value={summary?.replied ?? 0} />
        <Stat label="Sequence finished" value={summary?.complete ?? 0} />
      </div>

      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <h2 className="font-heading font-bold text-lg text-[#0C382E]">Needs your attention</h2>
          {attention.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <Button
                size="sm"
                variant="outline"
                onClick={selectAllAttention}
                className="text-[11px] h-8"
              >
                Select All ({attention.length})
              </Button>
              {selectedIds.length > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={clearSelection}
                  className="text-[11px] h-8 text-[#0C382E]/60"
                >
                  Clear
                </Button>
              )}
              {eligibleForDrafting.length > 0 && (
                <Button
                  size="sm"
                  variant="green"
                  disabled={batchActionBusy}
                  onClick={handleBulkDraft}
                  className="text-[11px] font-bold h-8 flex items-center gap-1.5"
                >
                  {batchActionBusy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                  Generate Follow-ups ({selectedIds.length > 0 ? selectedIds.length : eligibleForDrafting.length})
                </Button>
              )}
              {eligibleForBulkSend.length > 0 && (
                <Button
                  size="sm"
                  variant="butter"
                  disabled={batchActionBusy}
                  onClick={() => setConfirmBulkSend(true)}
                  className="text-[11px] font-bold h-8 flex items-center gap-1.5 shadow-sm"
                >
                  <Send className="w-3 h-3" />
                  Send Approved Follow-ups ({eligibleForBulkSend.length})
                </Button>
              )}
            </div>
          )}
        </div>

        {confirmBulkSend && (
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 mb-4 space-y-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-heading font-bold text-sm text-amber-900">
                  Confirm Bulk Follow-up Send
                </h4>
                <p className="text-xs text-amber-800 mt-1">
                  You are about to dispatch <strong>{eligibleForBulkSend.length}</strong> approved follow-up email(s) via Gmail to verified recipients.
                  Companies that have replied, unsubscribed, or are closed will NEVER receive follow-ups.
                </p>
                <div className="mt-2 text-[11px] text-amber-900 max-h-24 overflow-y-auto space-y-0.5 pr-2">
                  {eligibleForBulkSend.map((item) => (
                    <div key={item.companyId} className="flex justify-between">
                      <span className="font-semibold">{item.companyName}</span>
                      <span className="text-amber-700">{item.recipientEmail}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-amber-200">
              <Button
                size="sm"
                variant="ghost"
                disabled={batchActionBusy}
                onClick={() => setConfirmBulkSend(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="green"
                disabled={batchActionBusy}
                onClick={handleBulkSendApproved}
                className="text-xs font-bold"
              >
                {batchActionBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
                Confirm and Send ({eligibleForBulkSend.length})
              </Button>
            </div>
          </div>
        )}

        {attention.length === 0 ? (
          <div className="bg-white border border-[#0C382E]/10 rounded-2xl p-10 text-center shadow-sm">
            <CheckCircle className="w-10 h-10 text-[#0C382E] mx-auto mb-2" />
            <h3 className="font-heading font-bold text-base text-[#0C382E]">All follow-ups are up to date</h3>
            <p className="text-xs text-[#0C382E]/60 max-w-md mx-auto mt-1">
              Nobody who was emailed is waiting on a follow-up right now. Companies show up here once their window opens.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {attention.map((item) => (
              <AttentionCard
                key={item.companyId}
                item={item}
                isSelected={selectedIds.includes(item.companyId)}
                onToggleSelect={() => toggleSelect(item.companyId)}
                onChanged={load}
              />
            ))}
          </div>
        )}
      </section>

      {waiting.length > 0 && (
        <section>
          <h2 className="font-heading font-bold text-lg text-[#0C382E] mb-3">Emailed, waiting for the window</h2>
          <div className="space-y-2">
            {waiting.map((item) => (
              <SimpleRow key={item.companyId} item={item} />
            ))}
          </div>
        </section>
      )}

      {replied.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-lg text-emerald-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Received Replies from Sponsors ({replied.length})</span>
            </h2>
            <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
              Sequence halted
            </span>
          </div>
          <div className="space-y-2">
            {replied.map((item) => (
              <RepliedCard key={item.companyId} item={item} />
            ))}
          </div>
        </section>
      )}

      {finished.length > 0 && (
        <section>
          <h2 className="font-heading font-bold text-lg text-[#0C382E] mb-3">Halted or finished</h2>
          <div className="space-y-2">
            {finished.map((item) => (
              <SimpleRow key={item.companyId} item={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white border border-[#0C382E]/10 rounded-2xl p-4 shadow-sm">
      <div className="text-2xl font-heading font-bold text-[#0C382E]">{value}</div>
      <div className="text-[11px] text-[#0C382E]/60 font-medium">{label}</div>
    </div>
  );
}

function RepliedCard({ item }: { item: FollowupItem }) {
  return (
    <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs hover:border-emerald-300 transition-colors">
      <div className="flex items-start gap-3.5 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200 font-black text-sm">
          {item.companyName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 space-y-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/app/sponsors/${item.companyId}`}
              className="font-heading font-bold text-base text-green-dark hover:underline truncate"
            >
              {item.companyName}
            </Link>
            <Badge variant="success" className="text-xs font-bold bg-emerald-100 text-emerald-800 border-emerald-300">
              Replied
            </Badge>
          </div>
          <div className="text-xs text-text-dim flex items-center gap-2 flex-wrap">
            <span className="font-medium text-green-dark/80">{item.recipientEmail}</span>
            <span>·</span>
            <span>Last contact {Math.floor(item.daysSinceLast)}d ago</span>
            <span>·</span>
            <span className="text-emerald-800 font-semibold">{item.reason}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Link href={`/app/sponsors/${item.companyId}`}>
          <Button
            size="sm"
            variant="outline"
            className="text-xs font-bold border-emerald-300 text-emerald-900 hover:bg-emerald-100 gap-1.5 shadow-2xs cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
            <span>View Conversation</span>
            <ArrowRight className="w-3 h-3 text-emerald-700" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

function SimpleRow({ item }: { item: FollowupItem }) {
  return (
    <div className="bg-white border border-[#0C382E]/10 rounded-xl px-4 py-3 flex flex-wrap items-center gap-3 justify-between">
      <div className="min-w-0">
        <div className="font-heading font-bold text-sm text-[#0C382E]">{item.companyName}</div>
        <div className="text-[11px] text-[#0C382E]/60 truncate">
          {item.recipientEmail} · {item.touchesSent} email{item.touchesSent === 1 ? '' : 's'} sent · last {Math.floor(item.daysSinceLast)} day(s) ago
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-[#0C382E]/60">{item.reason}</span>
        <Badge variant={item.state === 'waiting' ? 'info' : item.state === 'replied' ? 'success' : 'neutral'} className="text-xs">
          {STATE_LABEL[item.state]}
        </Badge>
      </div>
    </div>
  );
}

function AttentionCard({
  item,
  isSelected,
  onToggleSelect,
  onChanged,
}: {
  item: FollowupItem;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  onChanged: () => void;
}) {
  const { toast } = useToast();
  const draft = item.pendingDraft;
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [subject, setSubject] = useState(draft?.subject ?? '');
  const [body, setBody] = useState(draft?.body ?? '');

  useEffect(() => {
    setSubject(draft?.subject ?? '');
    setBody(draft?.body ?? '');
  }, [draft?.id, draft?.subject, draft?.body]);

  const post = async (url: string, payload: unknown) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || data.error) throw new Error(data.error || 'Request failed');
    return data;
  };

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
    } catch (err: any) {
      toast(err.message || 'Something went wrong', 'error');
    } finally {
      setBusy(false);
      onChanged();
    }
  };

  const createDraft = () =>
    run(async () => {
      await post('/api/followups/draft', { companyId: item.companyId });
      toast(`Follow-up drafted for ${item.companyName}. Review it before approving.`, 'success');
    });

  const save = () =>
    run(async () => {
      await post('/api/outreach/save', { id: draft!.id, subject, body });
      toast(draft!.status === 'approved' ? 'Edited. Please approve again.' : 'Draft saved', 'info');
    });

  const approve = () =>
    run(async () => {
      await post('/api/outreach/approve', { draftId: draft!.id });
      toast('Follow-up approved. You can send it now.', 'success');
    });

  const send = () =>
    run(async () => {
      await post('/api/outreach/send', { draftId: draft!.id, toEmail: item.recipientEmail });
      setConfirming(false);
      toast(`Follow-up sent to ${item.companyName}.`, 'success');
    });

  const closeProspect = () =>
    run(async () => {
      await post('/api/followups/action', { companyId: item.companyId, action: 'close' });
      toast(`${item.companyName} marked as closed. Follow-up sequence halted.`, 'info');
    });

  const dirty = !!draft && (subject !== draft.subject || body !== draft.body);

  return (
    <div className="bg-white p-5 rounded-2xl border border-[#0C382E]/10 shadow-sm space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {onToggleSelect && (
            <button
              type="button"
              onClick={onToggleSelect}
              className="text-[#0C382E] hover:scale-105 transition-transform mr-1"
            >
              {isSelected ? (
                <CheckSquare className="w-4 h-4 text-[#0C382E]" />
              ) : (
                <Square className="w-4 h-4 text-[#0C382E]/30" />
              )}
            </button>
          )}
          <span className="font-heading font-bold text-[#0C382E] text-base">{item.companyName}</span>
          <Badge variant="neutral" className="text-xs font-semibold">
            Email {item.nextTouch} of 3
          </Badge>
          <Badge variant="warning" className="text-xs">
            <Clock className="w-3 h-3 mr-1" />
            {Math.floor(item.daysSinceLast)} days since last email
          </Badge>
          {draft && (
            <Badge variant={draft.status === 'approved' ? 'success' : 'info'} className="text-xs">
              {draft.status === 'approved' ? 'Approved' : 'Draft'}
            </Badge>
          )}
        </div>

        <button
          type="button"
          disabled={busy}
          onClick={closeProspect}
          className="text-[11px] font-medium text-[#0C382E]/60 hover:text-red-700 flex items-center gap-1 transition-colors"
          title="Stop follow-up sequence and close prospect"
        >
          <XCircle className="w-3.5 h-3.5" />
          Close Prospect
        </button>
      </div>

      <div className="text-xs text-[#0C382E]/60 flex items-center gap-1.5">
        <User className="w-3.5 h-3.5" />
        <span>
          {item.recipientName ? `${item.recipientName} ` : ''}({item.recipientEmail})
        </span>
      </div>

      {!draft ? (
        <div className="flex items-center justify-between gap-3 flex-wrap bg-[#FAF4E6] p-3 rounded-xl border border-[#0C382E]/5">
          <div className="text-xs text-[#0C382E]/80">
            No reply after {Math.floor(item.daysSinceLast)} days. Last email: <em>{item.lastSubject}</em>
          </div>
          <Button size="sm" variant="green" disabled={busy} onClick={createDraft} className="gap-1.5 font-bold text-xs">
            <Send className="w-3.5 h-3.5" />
            Draft follow-up
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full rounded-xl border border-[#0C382E]/15 px-3 py-2 text-sm"
            aria-label="Subject"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={9}
            className="w-full rounded-xl border border-[#0C382E]/15 px-3 py-2 text-sm font-sans"
            aria-label="Body"
          />

          {confirming ? (
            <div className="flex items-center justify-between gap-3 flex-wrap bg-[#FAF4E6] p-3 rounded-xl border border-[#0C382E]/10">
              <span className="text-xs text-[#0C382E] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Send this follow-up to <strong>{item.recipientEmail}</strong>?
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" disabled={busy} onClick={() => setConfirming(false)} className="text-xs">
                  Cancel
                </Button>
                <Button size="sm" variant="green" disabled={busy} onClick={send} className="gap-1.5 font-bold text-xs">
                  <Send className="w-3.5 h-3.5" />
                  Confirm and send
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <Button size="sm" variant="outline" disabled={busy || !dirty} onClick={save} className="text-xs">
                Save changes
              </Button>
              <Button
                size="sm"
                variant="green"
                disabled={busy || dirty || draft.status === 'approved'}
                onClick={approve}
                className="text-xs font-bold"
              >
                Approve follow-up
              </Button>
              <Button
                size="sm"
                variant="butter"
                disabled={busy || dirty || draft.status !== 'approved'}
                onClick={() => setConfirming(true)}
                className="gap-1.5 text-xs font-bold"
              >
                <Send className="w-3.5 h-3.5" />
                Send
              </Button>
              {dirty && <span className="text-[11px] text-[#0C382E]/60">Save your edits to approve.</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
