'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle, Clock, Send, User, ShieldCheck } from 'lucide-react';
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

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/followups', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load follow-ups');
      setItems(data.items);
      setSummary(data.summary);
    } catch (err: any) {
      toast(err.message || 'Failed to load follow-ups', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return <div className="text-sm text-[#0C382E]/60 p-6">Loading follow-ups...</div>;
  }

  const attention = items.filter((i) => i.state === 'due' || i.state === 'draft_ready');
  const waiting = items.filter((i) => i.state === 'waiting');
  const finished = items.filter((i) => !['due', 'draft_ready', 'waiting'].includes(i.state));

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Need follow-up" value={(summary?.due ?? 0) + (summary?.draftReady ?? 0)} />
        <Stat label="Waiting for window" value={summary?.waiting ?? 0} />
        <Stat label="Replied (halted)" value={summary?.replied ?? 0} />
        <Stat label="Sequence finished" value={summary?.complete ?? 0} />
      </div>

      <section>
        <h2 className="font-heading font-bold text-lg text-[#0C382E] mb-3">Needs your attention</h2>
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
              <AttentionCard key={item.companyId} item={item} onChanged={load} />
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

function AttentionCard({ item, onChanged }: { item: FollowupItem; onChanged: () => void }) {
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

  const dirty = !!draft && (subject !== draft.subject || body !== draft.body);

  return (
    <div className="bg-white p-5 rounded-2xl border border-[#0C382E]/10 shadow-sm space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
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
